import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { FitbitAuthData } from '../../application/domain/model/fitbit.auth.data'
import { OAuthException } from '../../application/domain/exception/oauth.exception'
import moment from 'moment'
import jwt from 'jsonwebtoken'
import { PhysicalActivity } from '../../application/domain/model/physical.activity'
import { Sleep } from '../../application/domain/model/sleep'
import { Log } from '../../application/domain/model/log'
import { UserLog } from '../../application/domain/model/user.log'
import { MeasurementType } from '../../application/domain/model/measurement'
import { Weight } from '../../application/domain/model/weight'
import { IFitbitAuthDataRepository } from '../../application/port/fitbit.auth.data.repository.interface'
import { FitbitAuthDataEntity } from '../entity/fitbit.auth.data.entity'
import { IFitbitClientRepository } from '../../application/port/fitbit.client.repository.interface'
import { ValidationException } from '../../application/domain/exception/validation.exception'
import { ConflictException } from '../../application/domain/exception/conflict.exception'
import { RepositoryException } from '../../application/domain/exception/repository.exception'
import { ResourceDataType } from '../../application/domain/utils/resource.data.type'
import { IResourceRepository } from '../../application/port/resource.repository.interface'
import { Query } from './query/query'
import { Resource } from '../../application/domain/model/resource'

@injectable()
export class FitbitAuthDataRepository implements IFitbitAuthDataRepository {

    private max_calls_refresh_token: number = 3 // Max calls to refresh a access token

    constructor(
        @inject(Identifier.USER_AUTH_REPO_MODEL) private readonly _userAuthRepoModel: any,
        @inject(Identifier.FITBIT_AUTH_DATA_ENTITY_MAPPER)
        private readonly _fitbitAuthEntityMapper: IEntityMapper<FitbitAuthData, FitbitAuthDataEntity>,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger,
        @inject(Identifier.FITBIT_CLIENT_REPOSITORY) private readonly _fitbitClientRepo: IFitbitClientRepository,
        @inject(Identifier.RESOURCE_REPOSITORY) readonly _resourceRepo: IResourceRepository
    ) {
    }

    public revokeToken(accessToken: string): Promise<boolean> {
        return this._fitbitClientRepo.revokeToken(accessToken)
    }

    public refreshToken(userId: string, accessToken: string, refreshToken: string, expiresIn?: number): Promise<FitbitAuthData> {
        return new Promise<FitbitAuthData>(async (resolve, reject) => {
            this._fitbitClientRepo.refreshToken(accessToken, refreshToken, expiresIn)
                .then(async tokenData => {
                    if (!tokenData) return resolve(undefined)
                    return this.updateRefreshToken(userId, new FitbitAuthData().fromJSON(tokenData))
                }).catch(err => reject(err))
        })
    }

    private updateRefreshToken(userId: string, token: FitbitAuthData): Promise<FitbitAuthData> {
        const itemUp: any = this._fitbitAuthEntityMapper.transform(token)
        return new Promise<FitbitAuthData>((resolve, reject) => {
            this._userAuthRepoModel.findOneAndUpdate({ user_id: userId }, itemUp, { new: true })
                .then(res => {
                    if (!res) return resolve(undefined)
                    return resolve(this._fitbitAuthEntityMapper.transform(res))
                }).catcj(err => this.mongoDBErrorListener(err))
        })
    }

    public async subscribeUserEvent(data: FitbitAuthData, resource: string, subscriptionId: string): Promise<void> {
        return this._fitbitClientRepo.subscribeUserEvent(data, resource, subscriptionId)
    }

    public syncFitbitUserData(data: FitbitAuthData, lastSync: string, calls: number): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const payload: any = await this.getTokenPayload(data.access_token!)
                const scopes: Array<string> = payload.scopes.split(' ')

                const weights: Array<any> = scopes.includes('rwei') ?
                    await this.syncWeightData(data, lastSync) : []
                const sleep: Array<any> = scopes.includes('rsle') ?
                    await this.syncSleepData(data, lastSync) : []
                const activities: Array<any> = scopes.includes('ract') ?
                    await this.syncUserActivities(data, lastSync) : []
                const stepsLogs: Array<any> = scopes.includes('ract') ?
                    await this.syncUserActivitiesLogs(data, lastSync, 'steps') : []
                const caloriesLogs: Array<any> = scopes.includes('ract') ?
                    await this.syncUserActivitiesLogs(data, lastSync, 'calories') : []
                const minutesSedentaryLogs: Array<any> = scopes.includes('ract') ?
                    await this.syncUserActivitiesLogs(data, lastSync, 'minutesSedentary') : []
                const minutesLightlyActiveLogs: Array<any> = scopes.includes('ract') ?
                    await this.syncUserActivitiesLogs(data, lastSync, 'minutesLightlyActive') : []
                const minutesFairlyActiveLogs: Array<any> = scopes.includes('ract') ?
                    await this.syncUserActivitiesLogs(data, lastSync, 'minutesFairlyActive') : []
                const minutesVeryActiveLogs: Array<any> = scopes.includes('ract') ?
                    await this.syncUserActivitiesLogs(data, lastSync, 'minutesVeryActive') : []

                const weightList: Array<Weight> = await this.parseWeightList(weights, data.user_id!)
                const activitiesList: Array<PhysicalActivity> = await this.parsePhysicalActivityList(activities, data.user_id!)
                const sleepList: Array<Sleep> = await this.parseSleepList(sleep, data.user_id!)
                const userLog: UserLog = await this.parseActivityLogs(
                    stepsLogs,
                    caloriesLogs,
                    minutesSedentaryLogs,
                    minutesLightlyActiveLogs,
                    this.mergeLogsValues(minutesFairlyActiveLogs, minutesVeryActiveLogs),
                    data.user_id!
                )

                // This data must be published to the message bus.
                weightList
                activitiesList
                sleepList
                userLog

                // Finally, the last sync variable from user needs to be updated
                await this.updateLastSync(data.user_id!, moment().toISOString())
                this._logger.info(`Data sync from ${data.user_id} at ${moment().toISOString()} successful!`)
                return resolve()
            } catch (err) {
                if (err.type) {
                    /*
                    * If the token was expired, it will try refresh the token and make a new data request.
                    * If the token or refresh token was invalid, the method reject an error for invalid token / refresh token.
                    * Otherwise, the method will reject the respective error.
                    */
                    if (err.type === 'expired_token') {
                        if (calls === this.max_calls_refresh_token) {
                            return reject(new OAuthException(
                                'invalid_token',
                                `The access token could not be refresh: ${data.access_token}`,
                                'Probably, this access token or the refresh token was invalid. Please make a new request.'))
                        }
                        try {
                            await this.refreshToken(data.user_id!, data.access_token!, data.refresh_token!)
                        } catch (err) {
                            return reject(err)
                        }
                        setTimeout(() => this.syncFitbitUserData(data, lastSync, calls + 1), 1000)
                    } else if (err.type === 'invalid_token') {
                        return reject(new OAuthException('invalid_token', `Access token invalid: ${data.access_token}`))
                    }
                    return reject(new OAuthException(err.type, err.message))
                }
                return reject(err)
            }
        })
    }

    public updateLastSync(userId: string, lastSync: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._userAuthRepoModel.findOneAndUpdate(
                { 'fitbit.user_id': userId },
                { 'fitbit.last_sync': lastSync },
                { new: true })
                .then(res => resolve(!!res))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public syncLastFitbitUserData(data: FitbitAuthData, userId: string, type: string, date: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (type === ResourceDataType.BODY) {
                this.getUserBodyDataFromInterval(data.access_token!, date, date)
                    .then(async weights => {
                        if (weights && weights.length) {
                            const resources: Array<any> = []
                            for await(const weight of weights) {
                                const exists: boolean =
                                    await this._resourceRepo.checkExists(new Query().fromJSON({
                                        filters: { resource_id: weight.logId }
                                    }))
                                if (!exists) {
                                    resources.push(weight)
                                }
                            }
                            // Parse list of weights
                            const weightList: Array<Weight> = this.parseWeightList(resources, userId)
                            if (weightList.length) {
                                this._logger.info(`Weight data received from ${userId}: `
                                    + `${weightList[0].value}${weightList[0].unit}.`)
                                // Publish list of weights

                                // If publish is successful, save the sync resources on database
                                await this.saveResourceList(resources, userId)
                            }
                        }
                    })
                    .catch(err => reject(err))
            } else if (type === ResourceDataType.ACTIVITIES) {
                this.getUserActivities(data.access_token!, 1, date)
                    .then(async activities => {
                        if (activities && activities.length) {
                            const resources: Array<any> = []
                            for await(const activity of activities) {
                                const exists: boolean =
                                    await this._resourceRepo.checkExists(new Query().fromJSON({
                                        filters: { resource_id: activity.logId }
                                    }))
                                if (!exists) resources.push(activity)

                            }
                            // Parse list of activities
                            const activityList: Array<PhysicalActivity> = this.parsePhysicalActivityList(resources, userId)
                            if (activityList.length) {
                                this._logger.info(`Activity data received from  ${userId}: ${activityList[0].name}.`)
                                // Publish list of weights

                                // If publish is successful, save the sync resources on database
                                await this.saveResourceList(resources, userId)
                            }
                        }
                    })
                    .catch(err => reject(err))
            } else if (type === ResourceDataType.SLEEP) {
                this.getUserSleep(data.access_token!, 1, date)
                    .then(async sleeps => {
                        const resources: Array<any> = []
                        if (sleeps && sleeps.length) {
                            for await (const sleep of sleeps) {
                                const exists: boolean =
                                    await this._resourceRepo.checkExists(new Query().fromJSON({
                                        filters: { resource_id: sleep.logId }
                                    }))
                                if (!exists) resources.push(sleep)
                            }
                            // Parse list of sleep
                            const sleepList: Array<Sleep> = this.parseSleepList(resources, userId)
                            if (sleepList.length) {
                                this._logger.info(`Sleep data received from ${userId} from ${sleepList[0].start_time}.`)

                                // If publish is successful, save the sync resources on database
                                await this.saveResourceList(resources, userId)
                            }
                        }
                    })
                    .catch(err => reject(err))
            }
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

    private saveResourceList(resources: Array<any>, userId: string): Promise<Array<Resource>> {
        return new Promise<Array<Resource>>(async (resolve, reject) => {
            const result: Array<Resource> = []
            for await (const item of resources) {
                try {
                    const resource: Resource = await this._resourceRepo.create(new Resource().fromJSON({
                        resource_id: item.logId,
                        date_sync: new Date().toISOString(),
                        user_id: userId,
                        provider: 'Fitbit'
                    }))
                    result.push(resource)
                } catch (err) {
                    return reject(this.mongoDBErrorListener(err))
                }
            }
            return resolve(result)
        })
    }

    private async syncWeightData(data: FitbitAuthData, lastSync: string): Promise<Array<any>> {
        try {
            const result: Array<any> = lastSync ?
                await this.getUserBodyDataFromInterval(
                    data.access_token!,
                    moment(lastSync).format('YYYY-MM-DD'),
                    moment().format('YYYY-MM-DD'))
                : [
                    ...await this.getUserBodyDataFromInterval(
                        data.access_token!,
                        moment().subtract(1, 'month').format('YYYY-MM-DD'),
                        moment().format('YYYY-MM-DD')),
                    ...await this.getUserBodyDataFromInterval(
                        data.access_token!,
                        moment().subtract(2, 'month').format('YYYY-MM-DD'),
                        moment().subtract(1, 'month').format('YYYY-MM-DD')),
                    ...await this.getUserBodyDataFromInterval(
                        data.access_token!,
                        moment().subtract(3, 'month').format('YYYY-MM-DD'),
                        moment().subtract(2, 'month').format('YYYY-MM-DD')),
                    ...await this.getUserBodyDataFromInterval(
                        data.access_token!,
                        moment().subtract(4, 'month').format('YYYY-MM-DD'),
                        moment().subtract(3, 'month').format('YYYY-MM-DD')),
                    ...await this.getUserBodyDataFromInterval(
                        data.access_token!,
                        moment().subtract(5, 'month').format('YYYY-MM-DD'),
                        moment().subtract(4, 'month').format('YYYY-MM-DD')),
                    ...await this.getUserBodyDataFromInterval(
                        data.access_token!,
                        moment().subtract(6, 'month').format('YYYY-MM-DD'),
                        moment().subtract(5, 'month').format('YYYY-MM-DD'))
                ]
            return Promise.resolve(result)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private async syncSleepData(data: FitbitAuthData, lastSync: string): Promise<Array<any>> {
        try {
            const result: Array<any> = await this.getUserSleep(
                data.access_token!,
                100,
                lastSync ? moment(lastSync).format('YYYY-MM-DD') :
                    moment().subtract(6, 'month').format('YYYY-MM-DD'))
            return Promise.resolve(result)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private async syncUserActivities(data: FitbitAuthData, lastSync: string): Promise<Array<any>> {
        try {
            const result: Array<any> = await this.getUserActivities(
                data.access_token!,
                100,
                lastSync ? moment(lastSync).format('YYYY-MM-DD') :
                    moment().subtract(6, 'month').format('YYYY-MM-DD'))
            return Promise.resolve(result)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private async syncUserActivitiesLogs(data: FitbitAuthData, lastSync: string, resource: string): Promise<Array<any>> {
        try {
            const result: Array<any> = await this.getUserActivityLogs(
                data.access_token!,
                resource,
                lastSync ? moment(lastSync).format('YYYY-MM-DD') :
                    moment().subtract(6, 'month').format('YYYY-MM-DD'),
                'today'
            )
            return Promise.resolve(result)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private async getUserActivityLogs(token: string, resource: string, baseDate: string, endDate: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            return this._fitbitClientRepo
                .getDataFromPath(`/activities/tracker/${resource}/date/${baseDate}/${endDate}.json`, token)
                .then(result => resolve(result[`activities-tracker-${resource}`]))
                .catch(err => reject(err))
        })
    }

    private async getUserBodyDataFromInterval(token: string, baseDate: string, endDate: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this._fitbitClientRepo
                .getDataFromPath(`/body/log/weight/date/${baseDate}/${endDate}.json`, token)
                .then(result => resolve(result.weight))
                .catch(err => reject(err))
        })
    }

    private async getUserActivities(token: string, limit: number, afterDate: string): Promise<any> {
        const path: string = `/activities/list.json?afterDate=${afterDate}&sort=desc&offset=0&limit=${limit}`
        return new Promise<any>((resolve, reject) => {
            this._fitbitClientRepo.getDataFromPath(path, token)
                .then(result => resolve(result.activities))
                .catch(err => reject(err))
        })
    }

    private async getUserSleep(token: string, limit: number, afterDate: string): Promise<any> {
        const path: string = `/sleep/list.json?afterDate=${afterDate}&sort=desc&offset=0&limit=${limit}`
        return new Promise<any>((resolve, reject) => {
            this._fitbitClientRepo.getDataFromPath(path, token)
                .then(result => resolve(result.sleep))
                .catch(err => reject(err))
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

    // // Parsers
    private parseWeightList(weights: Array<any>, userId: string): Array<Weight> {
        if (!weights || !weights.length) return []
        return weights.map(item => new Weight().fromJSON(this.parseWeight(item, userId)))
    }

    private parseWeight(item: any, userId: string): Weight {
        if (!item) return item
        return new Weight().fromJSON({
            type: MeasurementType.WEIGHT,
            timestamp: moment(item.date).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
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
        return new PhysicalActivity().fromJSON({
            type: 'physical_activity',
            start_time: item.startTime,
            end_time: moment(item.startTime).add(item.duration, 'milliseconds').format(),
            duration: item.duration,
            child_id: userId,
            name: item.activityName,
            calories: item.calories,
            steps: item.steps,
            levels: item.activityLevel.map(level => {
                return { duration: level.minutes, name: level.name }
            }),
            heart_rate: item.averageHeartRate && item.heartRateZones ? {
                average: item.averageHeartRate,
                out_of_range_zone: item.heartRateZones.filter(zone => {
                    if (zone.name === 'Out of Range') return { min: zone.min, max: zone.max, duration: zone.minutes }
                })[0],
                fat_burn_zone: item.heartRateZones.filter(zone => {
                    if (zone.name === 'Fat Burn') return { min: zone.min, max: zone.max, duration: zone.minutes }
                })[0],
                cardio_zone: item.heartRateZones.filter(zone => {
                    if (zone.name === 'Cardio') return { min: zone.min, max: zone.max, duration: zone.minutes }
                })[0],
                peak_zone: item.heartRateZones.filter(zone => {
                    if (zone.name === 'Peak') return { min: zone.min, max: zone.max, duration: zone.minutes }
                })[0]
            } : undefined
        })
    }

    private parseSleepList(sleep: Array<any>, userId: string): Array<Sleep> {
        if (!sleep || !sleep.length) return []
        return sleep.map(item => this.parseSleep(item, userId))
    }

    private parseSleep(item: any, userId: string): Sleep {
        if (!item) return item
        return new Sleep().fromJSON({
            start_time: item.startTime,
            end_time: moment(item.startTime).add(item.duration, 'milliseconds').format(),
            duration: item.duration,
            type: item.type,
            pattern: {
                data_set: item.levels.data.map(value => {
                    return {
                        start_time: value.startTime,
                        name: value.level, duration: `${parseInt(value.seconds, 10) * 1000}`
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
            user_id: userId,
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

    // MongoDB Error Listener
    protected mongoDBErrorListener(err: any): ValidationException | ConflictException | RepositoryException | undefined {
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
