import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { FitbitAuthData } from '../../application/domain/model/fitbit.auth.data'
import moment from 'moment'
import jwt from 'jsonwebtoken'
import { PhysicalActivity } from '../../application/domain/model/physical.activity'
import { Sleep } from '../../application/domain/model/sleep'
import { Log } from '../../application/domain/model/log'
import { UserLog } from '../../application/domain/model/user.log'
import { MeasurementType } from '../../application/domain/model/measurement'
import { Weight } from '../../application/domain/model/weight'
import { IFitbitDataRepository } from '../../application/port/fitbit.auth.data.repository.interface'
import { FitbitAuthDataEntity } from '../entity/fitbit.auth.data.entity'
import { IFitbitClientRepository } from '../../application/port/fitbit.client.repository.interface'
import { ValidationException } from '../../application/domain/exception/validation.exception'
import { ConflictException } from '../../application/domain/exception/conflict.exception'
import { RepositoryException } from '../../application/domain/exception/repository.exception'
import { ResourceDataType } from '../../application/domain/utils/resource.data.type'
import { IResourceRepository } from '../../application/port/resource.repository.interface'
import { Query } from './query/query'
import { Resource } from '../../application/domain/model/resource'
import { IEventBus } from '../port/eventbus.interface'
import { DataSync } from '../../application/domain/model/data.sync'
import { LogSync } from '../../application/domain/model/log.sync'
import { UserAuthData } from '../../application/domain/model/user.auth.data'
import { UserAuthDataEntity } from '../entity/user.auth.data.entity'
import { FitbitClientException } from '../../application/domain/exception/fitbit.client.exception'

@injectable()
export class FitbitDataRepository implements IFitbitDataRepository {
    constructor(
        @inject(Identifier.USER_AUTH_REPO_MODEL) private readonly _userAuthRepoModel: any,
        @inject(Identifier.USER_AUTH_DATA_ENTITY_MAPPER)
        private readonly _userAuthDataEntityMapper: IEntityMapper<UserAuthData, UserAuthDataEntity>,
        @inject(Identifier.FITBIT_AUTH_DATA_ENTITY_MAPPER)
        private readonly _fitbitAuthEntityMapper: IEntityMapper<FitbitAuthData, FitbitAuthDataEntity>,
        @inject(Identifier.FITBIT_CLIENT_REPOSITORY) private readonly _fitbitClientRepo: IFitbitClientRepository,
        @inject(Identifier.RESOURCE_REPOSITORY) readonly _resourceRepo: IResourceRepository,
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public removeFitbitAuthData(userId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._userAuthRepoModel
                .updateOne({ user_id: userId }, { $unset: { fitbit: '' } })
                .then(res => resolve(!!res))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public revokeToken(accessToken: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._fitbitClientRepo.revokeToken(accessToken)
                .then(res => resolve(res))
                .catch(err => reject(this.fitbitClientErrorListener(err, accessToken)))
        })
    }

    public refreshToken(userId: string, accessToken: string, refreshToken: string, expiresIn?: number): Promise<FitbitAuthData> {
        return new Promise<FitbitAuthData>(async (resolve, reject) => {
            this._fitbitClientRepo.refreshToken(accessToken, refreshToken, expiresIn)
                .then(async tokenData => {
                    if (!tokenData) return resolve(undefined)
                    const authData: FitbitAuthData = await this.manageAuthData(tokenData)
                    const newTokenData: UserAuthData = await this.updateRefreshToken(userId, authData)
                    return resolve(newTokenData.fitbit)
                }).catch(err => {
                if (err.type) return reject((this.fitbitClientErrorListener(err, accessToken, refreshToken)))
                return reject(err)
            })
        })
    }

    private async manageAuthData(authData: any): Promise<FitbitAuthData> {
        try {
            const result: FitbitAuthData = new FitbitAuthData()
            const payload: any = await this.getTokenPayload(authData.access_token)
            if (payload.sub) result.user_id = payload.sub
            if (payload.scopes) result.scope = payload.scopes
            if (payload.exp) result.expires_in = payload.exp
            result.access_token = authData.access_token
            result.refresh_token = authData.refresh_token
            result.token_type = 'Bearer'
            result.status = 'valid_token'
            return Promise.resolve(result)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async syncFitbitData(data: FitbitAuthData, userId: string): Promise<DataSync> {
        return new Promise<DataSync>(async (resolve, reject) => {
            try {
                if (!data || !data.scope) {
                    throw new RepositoryException('Invalid scope, cannot be empty.')
                }
                const scopes: Array<string> = data.scope!.split(' ')
                const promises: Array<Promise<any>> = []
                let syncWeights: Array<any> = []
                let syncSleep: Array<any> = []
                let syncActivities: Array<any>
                let stepsLogs: Array<any>
                let caloriesLogs: Array<any>
                let minutesSedentaryLogs: Array<any>
                let minutesLightlyActiveLogs: Array<any>
                let minutesFairlyActiveLogs: Array<any>
                let minutesVeryActiveLogs: Array<any>

                if (scopes.includes('rwei')) syncWeights = await this.syncWeightData(data)
                if (scopes.includes('rsle')) syncSleep = await this.syncSleepData(data)
                if (scopes.includes('ract')) {
                    promises.push(this.syncUserActivities(data))
                    promises.push(this.syncUserActivitiesLogs(data, 'steps'))
                    promises.push(this.syncUserActivitiesLogs(data, 'calories'))
                    promises.push(this.syncUserActivitiesLogs(data, 'minutesSedentary'))
                    promises.push(this.syncUserActivitiesLogs(data, 'minutesLightlyActive'))
                    promises.push(this.syncUserActivitiesLogs(data, 'minutesFairlyActive'))
                    promises.push(this.syncUserActivitiesLogs(data, 'minutesVeryActive'))
                }
                const result = await Promise.all(promises)
                syncActivities = result[0] || []
                stepsLogs = result[1] || []
                caloriesLogs = result[2] || []
                minutesSedentaryLogs = result[3] || []
                minutesLightlyActiveLogs = result[4] || []
                minutesFairlyActiveLogs = result[5] || []
                minutesVeryActiveLogs = result[6] || []

                // Filter list of data for does not sync data that was saved
                const weights: Array<any> = await this.filterDataAlreadySync(syncWeights, ResourceDataType.BODY, userId)
                const sleep: Array<any> = await this.filterDataAlreadySync(syncSleep, ResourceDataType.SLEEP, userId)
                const activities: Array<any> = await this.filterDataAlreadySync(syncActivities,
                    ResourceDataType.ACTIVITIES, userId)

                const weightList: Array<Weight> = await this.parseWeightList(weights, userId)
                const activitiesList: Array<PhysicalActivity> = await this.parsePhysicalActivityList(activities, userId)
                const sleepList: Array<Sleep> = await this.parseSleepList(sleep, userId)
                const userLog: UserLog = await this.parseActivityLogs(
                    stepsLogs,
                    caloriesLogs,
                    minutesSedentaryLogs,
                    minutesLightlyActiveLogs,
                    this.mergeLogsValues(minutesFairlyActiveLogs, minutesVeryActiveLogs),
                    userId
                )

                // The sync data must be published to the message bus.
                if (activitiesList.length) {
                    this._eventBus.bus
                        .pubSyncPhysicalActivity(activitiesList.map(item => item.toJSON()))
                        .then(() => this._logger.info(`Physical activities from ${userId} successful published!`))
                        .catch(err => this._logger.error(`Error publishing physical activities: ${err.message}`))
                }

                if (weightList.length) {
                    this._eventBus.bus
                        .pubSyncWeight(weightList.map(item => item.toJSON()))
                        .then(() => this._logger.info(`Weight Measurements from ${userId} successful published!`))
                        .catch(err => this._logger.error(`Error publishing weights: ${err.message}`))
                }

                if (sleepList.length) {
                    this._eventBus.bus
                        .pubSyncSleep(sleepList.map(item => item.toJSON()))
                        .then(() => this._logger.info(`Sleep from ${userId} successful published!`))
                        .catch(err => this._logger.error(`Error publishing sleep: ${err.message}`))
                }

                this.manageResources(syncActivities, userId, ResourceDataType.ACTIVITIES)
                this.manageResources(syncWeights, userId, ResourceDataType.BODY)
                this.manageResources(syncSleep, userId, ResourceDataType.SLEEP)

                const logList: Array<any> = userLog.toJSONList()
                if (logList && logList.length) {
                    this._eventBus.bus
                        .pubSyncLog(logList)
                        .then(() => this._logger.info(`Activities logs from ${userId} successful published!`))
                        .catch(err => this._logger.error(`Error publishing logs: ${err.message}`))
                }

                // Finally, the last sync variable from user needs to be updated
                const lastSync = moment.utc().format()
                this.updateLastSync(userId, lastSync)
                    .then(res => {
                        if (res) this.publishLastSync(userId, lastSync)
                    })
                    .catch(err => this._logger.info(`Error at update the last sync: ${err.message}`))

                // Build Object to return
                const dataSync: DataSync = new DataSync()
                dataSync.user_id = userId
                dataSync.activities = activitiesList.length || 0
                dataSync.weights = weightList.length || 0
                dataSync.sleep = sleepList.length || 0
                dataSync.logs = new LogSync().fromJSON({
                    steps: userLog.steps.length || 0,
                    calories: userLog.calories.length || 0,
                    active_minutes: userLog.active_minutes.length || 0,
                    lightly_active_minutes: userLog.lightly_active_minutes.length || 0,
                    sedentary_minutes: userLog.sedentary_minutes.length || 0
                })
                return resolve(dataSync)
            } catch (err) {
                return reject(err)
            }
        })
    }

    public updateLastSync(userId: string, lastSync: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._userAuthRepoModel.findOneAndUpdate(
                { user_id: userId },
                { 'fitbit.last_sync': lastSync },
                { new: true })
                .then(res => resolve(!!res))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public getTokenPayload(token: string): Promise<any> {
        try {
            return Promise.resolve(jwt.decode(token))
        } catch (err) {
            return Promise.reject(new ValidationException('Could not complete get token information. ' +
                'Please try again later.'))
        }
    }

    public publishLastSync(userId: string, lastSync: string): void {
        this._eventBus.bus.pubFitbitLastSync({ child_id: userId, last_sync: lastSync })
            .then(() => this._logger.info(`Last sync from ${userId} successful published!`))
            .catch(err => this._logger.error(`Error at publish last sync: ${err.message}`))
    }

    private updateRefreshToken(userId: string, token: FitbitAuthData): Promise<UserAuthData> {
        const itemUp: any = this._fitbitAuthEntityMapper.transform(token)
        return new Promise<UserAuthData>((resolve, reject) => {
            this._userAuthRepoModel.findOneAndUpdate(
                { user_id: userId },
                { fitbit: itemUp },
                { new: true })
                .then(res => {
                    if (!res) return resolve(undefined)
                    return resolve(this._userAuthDataEntityMapper.transform(res))
                }).catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    private async filterDataAlreadySync(data: Array<any>, type: string, userId: string): Promise<Array<any>> {
        try {
            const resources: Array<any> = []
            if (!data || !data.length) return resources
            for await(const item of data) {
                const query: Query = new Query().fromJSON({
                    filters: { 'resource.logId': item.logId, user_id: userId, type }
                })
                const exists: boolean = await this._resourceRepo.checkExists(query)
                if (!exists) resources.push(item)
            }
            return resources
        } catch (err) {
            return await Promise.reject(err)
        }
    }

    private cleanResourceList(userId, type): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._resourceRepo
                .deleteByQuery(new Query().fromJSON({ filters: { user_id: userId, type } }))
                .then(res => resolve(!!res))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    private manageResources(resources: Array<any>, userId: string, type: string): void {
        this.cleanResourceList(userId, type)
            .then(() => {
                this.saveResourceList(resources, userId, type)
                    .catch(err => this._logger.error(`Error at save physical activities logs: ${err.message}`))
            })
            .catch(err => this._logger.error(`Error at save physical activities logs: ${err.message}`))
    }

    private saveResourceList(resources: Array<any>, userId: string, type: string): Promise<Array<Resource>> {
        return new Promise<Array<Resource>>(async (resolve, reject) => {
            const result: Array<Resource> = []
            if (!resources || !resources.length) return result
            try {
                for await (const item of resources) {
                    const resource: Resource = await this._resourceRepo.create(new Resource().fromJSON({
                        type,
                        resource: item,
                        date_sync: moment().utc().format(),
                        user_id: userId,
                        provider: 'Fitbit'
                    }))
                    result.push(resource)
                }
            } catch (err) {
                return reject(this.mongoDBErrorListener(err))
            }
            return resolve(result)
        })
    }

    private syncWeightData(data: FitbitAuthData): Promise<Array<any>> {
        return new Promise<Array<any>>(async (resolve, reject) => {
            try {
                const result: Array<any> = new Array<any>()
                result.push(
                    this.getUserBodyDataFromInterval(
                        data.access_token!,
                        moment().subtract(1, 'month').format('YYYY-MM-DD'),
                        moment().format('YYYY-MM-DD'))
                )
                for (let i = 1; i < 4; i++) {
                    result.push(
                        this.getUserBodyDataFromInterval(
                            data.access_token!,
                            moment().subtract(i + 1, 'month').format('YYYY-MM-DD'),
                            moment().subtract(i, 'month').format('YYYY-MM-DD'))
                    )
                }
                return resolve((await Promise.all(result)).reduce((prev, current) => prev.concat(current), []))
            } catch (err) {
                return reject(err)
            }
        })
    }

    private async syncSleepData(data: FitbitAuthData): Promise<Array<any>> {
        return new Promise<Array<any>>(async (resolve, reject) => {
            try {
                return resolve(await this.getUserSleepBefore(
                    data.access_token!,
                    100,
                    moment().add(1, 'day').format('YYYY-MM-DD')))
            } catch (err) {
                return reject(err)
            }
        })
    }

    private syncUserActivities(data: FitbitAuthData): Promise<Array<any>> {
        return this.getLastUserActivities(data.access_token!)
    }

    private async syncUserActivitiesLogs(data: FitbitAuthData, resource: string): Promise<Array<any>> {
        return this.getUserActivityLogs(
            data.access_token!,
            resource,
            moment().subtract(12, 'month').format('YYYY-MM-DD'),
            'today'
        )
    }

    private async getUserSleepBefore(token: string, limit: number, beforeDate: string): Promise<any> {
        const path: string = `/sleep/list.json?beforeDate=${beforeDate}&sort=desc&offset=0&limit=${limit}`
        return new Promise<any>((resolve, reject) => {
            this._fitbitClientRepo.getDataFromPath(path, token)
                .then(result => resolve(result.sleep))
                .catch(err => reject(this.fitbitClientErrorListener(err, token)))
        })
    }

    private async getUserActivityLogs(token: string, resource: string, baseDate: string, endDate: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            return this._fitbitClientRepo
                .getDataFromPath(`/activities/tracker/${resource}/date/${baseDate}/${endDate}.json`, token)
                .then(result => resolve(result[`activities-tracker-${resource}`]))
                .catch(err => reject(this.fitbitClientErrorListener(err, token)))
        })
    }

    private async getUserBodyDataFromInterval(token: string, baseDate: string, endDate: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this._fitbitClientRepo
                .getDataFromPath(`/body/log/weight/date/${baseDate}/${endDate}.json`, token)
                .then(result => resolve(result.weight))
                .catch(err => reject(this.fitbitClientErrorListener(err, token)))
        })
    }

    private async getLastUserActivities(token: string): Promise<any> {
        const now: string = moment().add(1, 'day').format('YYYY-MM-DD')
        const path: string = `/activities/list.json?beforeDate=${now}&sort=desc&offset=0&limit=100`
        return new Promise<any>((resolve, reject) => {
            this._fitbitClientRepo.getDataFromPath(path, token)
                .then(result => resolve(result.activities))
                .catch(err => reject(this.fitbitClientErrorListener(err, token)))
        })
    }

    private getSleepSummary(summary: any): any {
        if (summary.asleep && summary.awake && summary.restless) {
            return {
                asleep: { count: summary.asleep.count, duration: summary.asleep.minutes * 60000 },
                awake: { count: summary.awake.count, duration: summary.awake.minutes * 60000 },
                restless: { count: summary.restless.count, duration: summary.restless.minutes * 60000 }
            }
        }
        return {
            deep: { count: summary.deep.count, duration: summary.deep.minutes * 60000 },
            light: { count: summary.light.count, duration: summary.light.minutes * 60000 },
            rem: { count: summary.rem.count, duration: summary.rem.minutes * 60000 },
            wake: { count: summary.wake.count, duration: summary.wake.minutes * 60000 }
        }
    }

    // Parsers
    private parseWeightList(weights: Array<any>, userId: string): Array<Weight> {
        if (!weights || !weights.length) return []
        return weights.map(item => new Weight().fromJSON(this.parseWeight(item, userId)))
    }

    private parseWeight(item: any, userId: string): Weight {
        if (!item) return item
        const timestamp = this.normalizeDate(item.date.concat('T').concat(item.time))
        return new Weight().fromJSON({
            type: MeasurementType.WEIGHT,
            timestamp,
            value: item.weight,
            unit: 'kg',
            body_fat: item.fat,
            child_id: userId
        })
    }

    private parsePhysicalActivityList(activities: Array<any>, userId: string): Array<PhysicalActivity> {
        if (!activities || !activities.length) return []
        return activities.map(item => this.parsePhysicalActivity(item, userId))
    }

    private parsePhysicalActivity(item: any, userId: string): PhysicalActivity {
        if (!item) return item

        const start_time = this.normalizeDate(item.startTime)
        const end_time = moment(start_time).add(item.duration, 'ms').utcOffset(start_time).format()
        const activity: any = {
            type: 'physical_activity',
            start_time,
            end_time,
            duration: item.duration,
            child_id: userId,
            name: item.activityName,
            calories: item.calories,
            steps: item.steps,
            distance: item.distance ? this.convertDistanceToMetter(item.distance, item.distanceUnit) : undefined,
            levels: item.activityLevel.map(level => {
                return { duration: level.minutes * 60000, name: level.name }
            })
        }
        if (item.averageHeartRate !== undefined && item.heartRateZones !== undefined) {

            const out_of_range = item.heartRateZones.find(zone => zone.name === 'Out of Range')
            const fat_burn = item.heartRateZones.find(zone => zone.name === 'Fat Burn')
            const cardio = item.heartRateZones.find(zone => zone.name === 'Cardio')
            const peak = item.heartRateZones.find(zone => zone.name === 'Peak')

            const out_of_range_zone = {
                min: out_of_range.min,
                max: out_of_range.max,
                duration: out_of_range.minutes * 60000
            }
            const fat_burn_zone = { min: fat_burn.min, max: fat_burn.max, duration: fat_burn.minutes * 60000 }
            const cardio_zone = { min: cardio.min, max: cardio.max, duration: cardio.minutes * 60000 }
            const peak_zone = { min: peak.min, max: peak.max, duration: peak.minutes * 60000 }

            activity.heart_rate = {
                average: item.averageHeartRate,
                out_of_range_zone,
                fat_burn_zone,
                cardio_zone,
                peak_zone
            }

        }
        return new PhysicalActivity().fromJSON(activity)
    }

    private convertDistanceToMetter(distance: number, unit: string): number {
        return unit === 'Kilometer' ? distance * 1000 : distance * 1609.344
    }

    private parseSleepList(sleep: Array<any>, userId: string): Array<Sleep> {
        if (!sleep || !sleep.length) return []
        return sleep.map(item => this.parseSleep(item, userId))
    }

    private parseSleep(item: any, userId: string): Sleep {
        if (!item) return item
        const start_time = this.normalizeDate(item.startTime)
        const end_time = moment(start_time).add(item.duration, 'ms').utcOffset(start_time).format()
        return new Sleep().fromJSON({
            start_time,
            end_time,
            duration: item.duration,
            type: item.type,
            pattern: {
                data_set: item.levels.data.map(value => {
                    return {
                        start_time: this.normalizeDate(value.dateTime),
                        name: value.level,
                        duration: parseInt(value.seconds, 10) * 1000
                    }
                }),
                summary: this.getSleepSummary(item.levels.summary)
            },
            child_id: userId
        })
    }

    private parseActivityLogs(stepsLogs: Array<any>,
                              caloriesLogs: Array<any>,
                              minutesSedentaryLogs: Array<any>,
                              minutesLightlyActiveLogs: Array<any>,
                              minutesActiveLogs: Array<any>,
                              userId: string): UserLog {

        return new UserLog().fromJSON({
            steps: this.parseLogs(userId, 'steps', stepsLogs),
            calories: this.parseLogs(userId, 'calories', caloriesLogs),
            active_minutes: this.parseLogs(userId, 'active_minutes', minutesActiveLogs),
            lightly_active_minutes: this.parseLogs(userId, 'lightly_active_minutes', minutesLightlyActiveLogs),
            sedentary_minutes: this.parseLogs(userId, 'sedentary_minutes', minutesSedentaryLogs)
        })
    }

    private parseLogs(userId: string, logType: string, logs: Array<any>): Array<Log> {
        if (!logs || !logs.length) return []
        return logs.map(log => new Log().fromJSON(this.parseLog(userId, logType, log)))
    }

    private parseLog(userId: string, logType: string, log: any): any {
        return {
            child_id: userId,
            type: logType,
            date: log.dateTime,
            value: log.value
        }
    }

    private mergeLogsValues(logsListOne: Array<any>, logsListTwo: Array<any>): Array<any> {
        const result: Array<any> = []
        for (let i = 0; i < logsListOne.length; i++) {
            if (logsListOne[i].dateTime === logsListTwo[i].dateTime) {
                result.push({
                    dateTime: logsListOne[i].dateTime,
                    value: `${parseInt(logsListOne[i].value, 10) + parseInt(logsListTwo[i].value, 10)}`
                })
            }
        }
        return result
    }

    private normalizeDate(date: string): string {
        return date.substr(0, 19).concat('Z')
    }

    public updateTokenStatus(userId: string, status: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._userAuthRepoModel.findOneAndUpdate(
                { user_id: userId },
                { 'fitbit.status': status },
                { new: true })
                .then(res => resolve(!!res))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    private fitbitClientErrorListener(err: any, accessToken?: string, refreshToken?: string): FitbitClientException | undefined {
        if (err.type === 'client_error') {
            return new FitbitClientException(
                'client_error',
                'Could not connect with the Fitbit Server',
                'Please try again later.')
        }
        if (err.type === 'expired_token') {
            return new FitbitClientException(
                'expired_token',
                'Access token expired.',
                `The access token ${accessToken} has been expired and needs to be refreshed.`)
        } else if (err.type === 'invalid_token') {
            return new FitbitClientException(
                'invalid_token',
                'Access token invalid.',
                `The access token ${accessToken} is invalid. Please make a new Fitbit Auth Data request and try again.`)
        } else if (err.type === 'invalid_grant') {
            return new FitbitClientException(
                'invalid_grant',
                'Refresh token invalid.',
                `The refresh token ${refreshToken} is invalid. Please make a new Fitbit Auth Data request and try again.`)
        } else if (err.type === 'system') {
            return new FitbitClientException(
                'system',
                `Data request limit for access token ${accessToken} has expired.`,
                'Please wait a minimum of one hour and try make the operation again.')
        } else if (err.type === 'invalid_client') {
            return new FitbitClientException(
                'invalid_client',
                'Invalid Fitbit Client data.',
                'The Fitbit Client credentials are invalid. The operation cannot be performed.')
        } else if (err.type === 'internal_error') {
            return new FitbitClientException('internal_error', 'internal_fitbit_error', err.message)
        }
        return new FitbitClientException(err.type, err.message)
    }

    // MongoDb Error Listener
    private mongoDBErrorListener(err: any): ValidationException | ConflictException | RepositoryException | undefined {
        if (err && err.name) {
            if (err.name === 'ValidationError') {
                return new ValidationException('Required fields were not provided!', err.message)
            } else if (err.name === 'CastError' || new RegExp(/(invalid format)/i).test(err)) {
                return new ValidationException('The given ID is in invalid format.',
                    'A 12 bytes hexadecimal ID similar to this')
            } else if (err.name === 'MongoError' && err.code === 11000) {
                return new ConflictException('A registration with the same unique data already exists!')
            } else if (err.name === 'ObjectParameterError') {
                return new ValidationException('Invalid query parameters!')
            }
        }
        return new RepositoryException('An internal error has occurred in the database!', 'Please try again later...')
    }
}
