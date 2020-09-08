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
import { ResourceType } from '../../application/domain/utils/resource.type'
import { IResourceRepository } from '../../application/port/resource.repository.interface'
import { Query } from './query/query'
import { Resource } from '../../application/domain/model/resource'
import { IEventBus } from '../port/eventbus.interface'
import { DataSync } from '../../application/domain/model/data.sync'
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

    public getTokenIntrospect(token: string): Promise<boolean> {
        return new Promise<any>((resolve, reject) => {
            this._fitbitClientRepo.getTokenIntrospect(token)
                .then(res => resolve(res))
                .catch(err => reject(this.fitbitClientErrorListener(err)))
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
        try {
            if (!data || !data.scope) {
                throw new RepositoryException('Invalid scope, cannot be empty.')
            }
            const scopes: Array<string> = data.scope!.split(' ')

            // Sync all Fitbit data
            const resources_promises: Array<Promise<any>> = [
                this.syncAndParseWeight(scopes, data.access_token!, userId),
                this.syncAndParseSleep(scopes, data.access_token!, userId),
                this.syncAndParseActivity(scopes, data.access_token!, userId)
            ]

            const logs_promises: Array<Promise<any>> = [
                this.syncAndParseLogs(scopes, data.access_token!, userId, ResourceType.STEPS, ResourceType.STEPS),
                this.syncAndParseLogs(scopes, data.access_token!, userId, ResourceType.CALORIES, ResourceType.CALORIES),
                this.syncAndParseLogs(scopes, data.access_token!,
                    userId, ResourceType.MINUTES_SEDENTARY, ResourceType.SEDENTARY_MINUTES),
                this.syncAndParseLogs(scopes, data.access_token!, userId, ResourceType.MINUTES_LIGHTLY_ACTIVE,
                    ResourceType.LIGHTLY_ACTIVE_MINUTES),
                this.syncAndParseActiveMinutesLogs(scopes, data.access_token!, userId)
            ]

            const resources_result: Array<any> = await Promise.allSettled(resources_promises)
            const logs_result: Array<any> = await Promise.allSettled(logs_promises)

            // Verify if someone has a sync error
            const resources_result_errors: Array<any> = resources_result.filter(item => item.status === 'rejected')
            const logs_result_errors: Array<any> = logs_result.filter(item => item.status === 'rejected')

            // If all syncs generates an error, reject the sync process error based on error from first promise
            if (resources_result.length === resources_result_errors.length) {
                return Promise.reject(resources_result_errors[0].reason)
            }
            if (logs_result.length === logs_result_errors.length) {
                return Promise.reject(resources_result_errors[0].reason)
            }

            // publish activity logs
            this.publishActivityLogs(logs_result, userId)

            // Finally, the last sync variable from user needs to be updated
            const lastSync = moment.utc().format()
            this.updateLastSync(userId, lastSync)
                .then(res => {
                    if (res) this.publishLastSync(userId, lastSync)
                })
                .catch(err => this._logger.info(`Error at update the last sync: ${err.message}`))

            // Build Object to return
            return Promise.resolve(this.buildResponseSync(resources_result, logs_result, userId))
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private buildResponseSync(resource_items: Array<any>, logs_items: Array<any>, userId: string): DataSync {
        const weights: Array<Weight> = resource_items[0].status === 'fulfilled' ? resource_items[0].value : []
        const sleep: Array<Sleep> = resource_items[1].status === 'fulfilled' ? resource_items[1].value : []
        const activities: Array<PhysicalActivity> = resource_items[2].status === 'fulfilled' ? resource_items[2].value : []
        const steps: Array<Log> = logs_items[0].value || []
        const calories: Array<Log> = logs_items[1].value || []
        const sedentary_minutes: Array<Log> = logs_items[2].value || []
        const lightly_active_minutes: Array<Log> = logs_items[3].value || []
        const active_minutes: Array<Log> = logs_items[4].value || []

        return new DataSync().fromJSON({
            user_id: userId,
            activities: activities.length,
            sleep: sleep.length,
            weights: weights.length,
            logs: {
                steps: steps.length,
                calories: calories.length,
                sedentary_minutes: sedentary_minutes.length,
                lightly_active_minutes: lightly_active_minutes.length,
                active_minutes: active_minutes.length
            }
        })
    }

    private publishActivityLogs(logs: any, userId: string): void {
        const user_log: UserLog = new UserLog()

        user_log.steps = logs[0].value
        user_log.calories = logs[1].value
        user_log.sedentary_minutes = logs[2].value
        user_log.lightly_active_minutes = logs[3].value
        user_log.active_minutes = logs[4].value

        const logList: Array<any> = user_log.toJSONList()
        if (logList && logList.length) {
            this._eventBus.bus
                .pubSyncLog(logList)
                .then(() => this._logger.info(`Activities logs from ${userId} successful published!`))
                .catch(err => this._logger.error(`Error publishing logs: ${err.message}`))
        }
    }

    private async syncAndParseWeight(scopes: Array<string>, token: string, userId: string): Promise<Array<Weight>> {
        try {
            // If the user does not have scopes for weight, returns an empty array
            if (!(scopes.includes('rwei'))) return Promise.resolve([])
            // Sync weight data
            const syncWeights: Array<any> = await this.syncWeightData(token)
            if (!syncWeights || !syncWeights.length) return Promise.resolve([])
            // Filter weight data with previous weight data already sync
            const filterSyncWeights: Array<any> = await this.filterDataAlreadySync(syncWeights, ResourceType.BODY, userId)
            if (!filterSyncWeights || !filterSyncWeights.length) return Promise.resolve([])
            const parseWeight: Array<Weight> = await this.parseWeightList(filterSyncWeights, userId)
            // Save and publish sync weight data
            if (parseWeight && parseWeight.length) {
                this.manageResources(syncWeights, userId, ResourceType.BODY).then().catch()
                this._eventBus.bus
                    .pubSyncWeight(parseWeight.map(item => item.toJSON()))
                    .then(() => this._logger.info(`Weight Measurements from ${userId} successful published!`))
                    .catch(err => this._logger.error(`Error publishing weights: ${err.message}`))
            }
            return Promise.resolve(parseWeight)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private async syncAndParseSleep(scopes: Array<string>, token: string, userId: string): Promise<Array<Sleep>> {
        try {
            // If the user does not have scopes for weight, returns an empty array
            if (!(scopes.includes('rsle'))) return Promise.resolve([])
            // Sync sleep data
            const syncSleep: Array<any> = await this.syncSleepData(token)
            if (!syncSleep || !syncSleep.length) return Promise.resolve([])
            // Filter sleep data with previous sleep data already sync
            const filterSleep: Array<any> = await this.filterDataAlreadySync(syncSleep, ResourceType.SLEEP, userId)
            if (!filterSleep || !filterSleep.length) return Promise.resolve([])
            // Parse sleep data
            const parseSleep: Array<Sleep> = await this.parseSleepList(filterSleep, userId)
            // Save and publish sync sleep data
            if (parseSleep && parseSleep.length) {
                this.manageResources(syncSleep, userId, ResourceType.SLEEP).then().catch()
                this._eventBus.bus
                    .pubSyncSleep(parseSleep.map(item => item.toJSON()))
                    .then(() => this._logger.info(`Sleep from ${userId} successful published!`))
                    .catch(err => this._logger.error(`Error publishing sleep: ${err.message}`))
            }
            return Promise.resolve(parseSleep)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private async syncAndParseActivity(scopes: Array<string>, token: string, userId: string): Promise<Array<PhysicalActivity>> {
        try {
            // If the user does not have scopes for activity, returns an empty array
            if (!(scopes.includes('ract'))) return Promise.resolve([])
            // Sync activity data
            const syncActivities: Array<any> = await this.syncUserActivities(token)
            if (!syncActivities || !syncActivities.length) return Promise.resolve([])
            // Filter activity data with previous activity data already sync
            const filterActivities: Array<any> =
                await this.filterDataAlreadySync(syncActivities, ResourceType.ACTIVITIES, userId)
            if (!filterActivities || !filterActivities.length) return Promise.resolve([])
            // Parse activity data
            const parseActivity: Array<PhysicalActivity> = await this.parsePhysicalActivityList(filterActivities, userId)
            // Save and publish sync activity data
            if (parseActivity && parseActivity.length) {
                this.manageResources(syncActivities, userId, ResourceType.ACTIVITIES).then().catch()
                this._eventBus.bus
                    .pubSyncPhysicalActivity(parseActivity.map(item => item.toJSON()))
                    .then(() => this._logger.info(`Physical activities from ${userId} successful published!`))
                    .catch(err => this._logger.error(`Error publishing physical activities: ${err.message}`))
            }
            return Promise.resolve(parseActivity)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private async syncAndParseLogs(scopes: Array<string>, token: string, userId: string, resource: string, parser: string):
        Promise<Array<Log>> {
        try {
            // If the user does not have scopes for activity, returns an empty array
            if (!(scopes.includes('ract'))) return Promise.resolve([])
            // Sync activity data log
            const activityDataLog: Array<any> = await this.syncUserActivitiesLogs(token, resource)
            if (!activityDataLog || !activityDataLog.length) return Promise.resolve([])
            // Parse activity data log
            const parseActivityLog: Array<Log> = await this.parseLogs(userId, parser, activityDataLog)
            return Promise.resolve(parseActivityLog)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private async syncAndParseActiveMinutesLogs(scopes: Array<string>, token: string, userId: string): Promise<Array<Log>> {
        try {
            // If the user does not have scopes for activity, returns an empty array
            if (!(scopes.includes('ract'))) return Promise.resolve([])
            // Sync activity data log
            const fairlyActiveLogs: Array<any> = await this.syncUserActivitiesLogs(token, ResourceType.MINUTES_FAIRLY_ACTIVE)
            const veryActiveLogs: Array<any> = await this.syncUserActivitiesLogs(token, ResourceType.MINUTES_VERY_ACTIVE)
            if (!fairlyActiveLogs || !fairlyActiveLogs.length || !veryActiveLogs || !veryActiveLogs.length) {
                return Promise.resolve([])
            }
            // Parse activity data log
            const parseActivityLog: Array<Log> = await this.parseLogs(userId, ResourceType.ACTIVE_MINUTES,
                this.mergeLogsValues(fairlyActiveLogs, veryActiveLogs))
            return Promise.resolve(parseActivityLog)
        } catch (err) {
            return Promise.reject(err)
        }
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
                .then(res => resolve(res))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    private async manageResources(resources: Array<any>, userId: string, type: string): Promise<void> {
        try {
            await this.cleanResourceList(userId, type)
            await this.saveResourceList(resources, userId, type)
            return Promise.resolve()
        } catch (err) {
            this._logger.error(`Error at save ${type} logs: ${err.message}`)
            return Promise.resolve()
        }
    }

    private async saveResourceList(resources: Array<any>, userId: string, type: string): Promise<Array<Resource>> {
        try {
            const result: Array<Resource> = []
            if (!resources || !resources.length) return Promise.resolve(result)
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
            return Promise.resolve(result)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private async syncWeightData(token: string): Promise<Array<any>> {
        try {
            const result: Array<any> = new Array<any>()
            result.push(
                this.getUserBodyDataFromInterval(
                    token,
                    moment().subtract(1, 'month').format('YYYY-MM-DD'),
                    moment().format('YYYY-MM-DD'))
            )
            for (let i = 1; i < 4; i++) {
                result.push(
                    this.getUserBodyDataFromInterval(
                        token,
                        moment().subtract(i + 1, 'month').format('YYYY-MM-DD'),
                        moment().subtract(i, 'month').format('YYYY-MM-DD'))
                )
            }
            return Promise.resolve((await Promise.all(result)).reduce((prev, current) => prev.concat(current), []))
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private async syncSleepData(token: string): Promise<Array<any>> {
        try {
            const result: Array<any> = await this.getUserSleepBefore(token, 100, moment().add(1, 'day').format('YYYY-MM-DD'))
            return Promise.resolve(result)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private syncUserActivities(token: string): Promise<Array<any>> {
        return this.getLastUserActivities(token)
    }

    private async syncUserActivitiesLogs(token: string, resource: string): Promise<Array<any>> {
        const start_date: string = moment().subtract(12, 'month').format('YYYY-MM-DD')
        return this.getUserActivityLogs(token, resource, start_date, 'today')
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
