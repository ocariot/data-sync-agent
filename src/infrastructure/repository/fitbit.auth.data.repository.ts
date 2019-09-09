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
import { IEventBus } from '../port/eventbus.interface'

@injectable()
export class FitbitAuthDataRepository implements IFitbitAuthDataRepository {

    private max_calls_refresh_token: number = 3 // Max calls to refresh a access token

    constructor(
        @inject(Identifier.USER_AUTH_REPO_MODEL) private readonly _userAuthRepoModel: any,
        @inject(Identifier.FITBIT_AUTH_DATA_ENTITY_MAPPER)
        private readonly _fitbitAuthEntityMapper: IEntityMapper<FitbitAuthData, FitbitAuthDataEntity>,
        @inject(Identifier.FITBIT_CLIENT_REPOSITORY) private readonly _fitbitClientRepo: IFitbitClientRepository,
        @inject(Identifier.RESOURCE_REPOSITORY) readonly _resourceRepo: IResourceRepository,
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
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
            this._userAuthRepoModel.findOneAndUpdate(
                { 'fitbit.user_id': userId },
                { fitbit: itemUp },
                { new: true })
                .then(res => {
                    if (!res) return resolve(undefined)
                    return resolve(this._fitbitAuthEntityMapper.transform(res))
                }).catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public async subscribeUserEvent(data: FitbitAuthData, resource: string, subscriptionId: string): Promise<void> {
        return this._fitbitClientRepo.subscribeUserEvent(data, resource, subscriptionId)
    }

    public async unsubscribeUserEvent(data: FitbitAuthData, resource: string, subscriptionId: string): Promise<void> {
        return this._fitbitClientRepo.unsubscribeUserEvent(data, resource, subscriptionId)
    }

    public syncFitbitUserData(data: FitbitAuthData, lastSync: string, calls: number, userId: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const payload: any = await this.getTokenPayload(data.access_token!)
                const scopes: Array<string> = payload.scopes.split(' ')

                const syncWeights: Array<any> = scopes.includes('rwei') ?
                    await this.syncWeightData(data, lastSync) : []
                const syncSleep: Array<any> = scopes.includes('rsle') ?
                    await this.syncSleepData(data, lastSync) : []
                const syncActivities: Array<any> = scopes.includes('ract') ?
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

                // Filter list of data for does not sync data that was saved
                const weights: Array<any> = await this.filterDataAlreadySync(syncWeights)
                const sleep: Array<any> = await this.filterDataAlreadySync(syncSleep)
                const activities: Array<any> = await this.filterDataAlreadySync(syncActivities)

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

                // The sync data must be published to the message bus.
                if (activitiesList.length) {
                    this._eventBus.bus.pubSavePhysicalActivity(activitiesList.map(item => item.toJSON()))
                        .then(() => {
                            this._logger.info(`Physical activities from ${userId} successful published!`)
                            this.saveResourceList(activities, data.user_id!)
                                .then(() => this._logger.info(`Physical Activity logs from ${userId} saved successful!`))
                                .catch(err => this._logger.error(`Error at save physical activities logs: ${err.message}`))
                        })
                        .catch(err => this._logger.error(`Error at publish physical activities logs: ${err.message}`))
                }
                if (weightList.length) {
                    this._eventBus.bus.pubSaveWeight(weightList.map(item => item.toJSON()))
                        .then(() => {
                            this._logger.info(`Weight Measurements from ${userId} successful published!`)
                            this.saveResourceList(weights, data.user_id!)
                                .then(() => this._logger.info(`Weight logs from ${data.user_id} saved successful!`))
                                .catch(err => this._logger.error(`Error at save weight logs: ${err.message}`))
                        })
                        .catch(err => this._logger.error(`Error at publish weight logs: ${err.message}`))
                }

                if (sleepList.length) {
                    this._eventBus.bus.pubSaveSleep(sleepList.map(item => item.toJSON()))
                        .then(() => {
                            this._logger.info(`Sleep from ${userId} successful published!`)
                            this.saveResourceList(sleep, data.user_id!)
                                .then(() => this._logger.info(`Sleep logs from ${userId} saved successful!`))
                                .catch(err => this._logger.error(`Error at save sleep logs: ${err.message}`))
                        })
                        .catch(err => this._logger.error(`Error at publish sleep logs: ${err.message}`))
                }

                this._eventBus.bus.pubSaveLog(userLog.toJSONList()).then(() => {
                    this._logger.info(`Activities logs from ${data.user_id!} successful published!`)
                })

                // Finally, the last sync variable from user needs to be updated

                lastSync = moment().toISOString()
                await this.updateLastSync(data.user_id!, lastSync)
                this._eventBus.bus.pubFitbitLastSync({ child_id: userId, last_sync: lastSync })
                    .then(() => this._logger.info(`Last sync from ${userId}successful published!`))
                    .catch(err => this._logger.error(`Error at publish last sync: ${err.message}`))
                return resolve()
            } catch (err) {
                if (err.type) {
                    /*
                    * If the token was expired, it will try refresh the token and make a new data request.
                    * If the token or refresh token was invalid, the method reject an error for invalid token/refresh token.
                    * Otherwise, the method will reject the respective error.
                    *
                    */
                    await this.publishFitbitAuthError(data, err, userId)
                    if (err.type === 'expired_token') {
                        if (calls === this.max_calls_refresh_token) {
                            return reject(new OAuthException(
                                'invalid_token',
                                `The access token could not be refresh: ${data.access_token}`,
                                'Probably, this access token or the refresh token was invalid. Please make a ' +
                                'new request.'))
                        }
                        try {
                            await this.refreshToken(data.user_id!, data.access_token!, data.refresh_token!)
                        } catch (err) {
                            return reject(err)
                        }
                        setTimeout(() => this.syncFitbitUserData(data, lastSync, calls + 1, userId), 1000)
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

    public async syncLastFitbitUserData(data: FitbitAuthData, userId: string, type: string, date: string): Promise<void> {
        try {
            if (type === ResourceDataType.BODY) await this.syncLastFitbitUserWeight(data, userId, date)
            else if (type === ResourceDataType.ACTIVITIES) {
                await this.syncLastFitbitUserActivity(data, userId, date)
                await this.syncLastFitbitUserActivityLogs(data, userId, date)
            } else if (type === ResourceDataType.SLEEP) await this.syncLastFitbitUserSleep(data, userId, date)
            const lastSync = moment().toISOString()
            await this.updateLastSync(data.user_id!, lastSync)
            this._eventBus.bus.pubFitbitLastSync({ child_id: userId, last_sync: lastSync })
                .then(() => this._logger.info(`Last sync from ${userId}successful published!`))
                .catch(err => this._logger.error(`Error at publish last sync: ${err.message}`))
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public getTokenPayload(token: string): Promise<any> {
        try {
            return Promise.resolve(jwt.decode(token))
        } catch (err) {
            return Promise.reject(new ValidationException('Could not complete get token information. ' +
                'Please try again later.'))
        }
    }

    private async filterDataAlreadySync(data: Array<any>): Promise<Array<any>> {
        try {
            const resources: Array<any> = []
            for await(const item of data) {
                const query: Query = new Query().fromJSON({ filters: { resource_id: item.logId } })
                const exists: boolean = await this._resourceRepo.checkExists(query)
                if (!exists) resources.push(item)
            }
            return Promise.resolve(resources)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private syncLastFitbitUserWeight(data: FitbitAuthData, userId: string, date: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getUserBodyDataFromInterval(data.access_token!, date, date)
                .then(async weights => {
                    if (weights && weights.length) {
                        const resources: Array<any> = await this.filterDataAlreadySync(weights)

                        // Parse list of weights
                        const weightList: Array<Weight> = this.parseWeightList(resources, userId)
                        if (weightList.length) {
                            // Publish list of weights
                            this._eventBus.bus.pubSaveWeight(weightList.map(item => item.toJSON()))
                                .then(() => {
                                    this._logger.info(`Weight Measurements from ${data.user_id!} successful published!`)
                                    this.saveResourceList(weights, data.user_id!)
                                        .then(() => {
                                            // If publish is successful, save the sync resources on database
                                            this._logger.info(`Weight logs from ${data.user_id} saved successful!`)
                                        })
                                        .catch(err => {
                                            this._logger.error(`Error at save weight: ${err.message}`)
                                        })
                                })
                                .catch(err => this._logger.error(`Error at publish weight: ${err.message}`))
                        }
                    }
                }).catch(err => reject(err))
        })
    }

    private syncLastFitbitUserActivity(data: FitbitAuthData, userId: string, date: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getUserActivities(data.access_token!, 1, date)
                .then(async activities => {
                    if (activities && activities.length) {
                        const resources: Array<any> = await this.filterDataAlreadySync(activities)

                        // Parse list of activities
                        const activityList: Array<PhysicalActivity> = this.parsePhysicalActivityList(resources, userId)
                        if (activityList.length) {
                            // Publish list of activities
                            this._eventBus.bus.pubSavePhysicalActivity(activityList.map(item => item.toJSON()))
                                .then(() => {
                                    this._logger.info(`Physical activities from ${data.user_id!} successful published!`)
                                    this.saveResourceList(activities, data.user_id!)
                                        .then(() => {
                                            // If publish is successful, save the sync resources on database
                                            this._logger.info(`Physical activities from ${data.user_id} saved successful!`)
                                        })
                                        .catch(err => {
                                            this._logger.error(`Error at save physical activities: ${err.message}`)
                                        })
                                })
                                .catch(err => this._logger.error(`Error at publish physical activities: ${err.message}`))
                        }
                    }
                }).catch(err => reject(err))
        })
    }

    private async syncLastFitbitUserActivityLogs(data: FitbitAuthData, userId: string, date: string): Promise<void> {
        try {
            const stepsLogs: Array<any> = await this.syncUserActivitiesLogs(data, date, 'steps')
            const caloriesLogs: Array<any> = await this.syncUserActivitiesLogs(data, date, 'calories')
            const minutesSedentaryLogs: Array<any> = await this.syncUserActivitiesLogs(data, date, 'minutesSedentary')
            const minutesLightlyActiveLogs: Array<any> = await this.syncUserActivitiesLogs(data, date, 'minutesLightlyActive')
            const minutesFairlyActiveLogs: Array<any> = await this.syncUserActivitiesLogs(data, date, 'minutesFairlyActive')
            const minutesVeryActiveLogs: Array<any> = await this.syncUserActivitiesLogs(data, date, 'minutesVeryActive')

            const userLog: UserLog = await this.parseActivityLogs(
                stepsLogs,
                caloriesLogs,
                minutesSedentaryLogs,
                minutesLightlyActiveLogs,
                this.mergeLogsValues(minutesFairlyActiveLogs, minutesVeryActiveLogs),
                data.user_id!
            )

            this._eventBus.bus.pubSaveLog(userLog.toJSONList())
                .then(() => {
                    this._logger.info(`Activities logs from ${userId} successful published!`)
                })
                .catch(err => this._logger.error(`Error at publish activities logs: ${err.message}`))
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private syncLastFitbitUserSleep(data: FitbitAuthData, userId: string, date: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getUserSleep(data.access_token!, 1, date)
                .then(async sleeps => {
                    if (sleeps && sleeps.length) {
                        const resources: Array<any> = await this.filterDataAlreadySync(sleeps)

                        // Parse list of sleep
                        const sleepList: Array<Sleep> = this.parseSleepList(resources, userId)
                        if (sleepList.length) {
                            // Publish list of sleep.
                            this._eventBus.bus.pubSavePhysicalActivity(sleepList.map(item => item.toJSON()))
                                .then(() => {
                                    this._logger.info(`Sleep from ${data.user_id!} successful published!`)
                                    this.saveResourceList(resources, data.user_id!)
                                        .then(() => {
                                            // If publish is successful, save the sync resources on database
                                            this._logger.info(`Sleep logs from ${data.user_id} saved successful!`)
                                        })
                                        .catch(err => {
                                            this._logger.error(`Error at save sleep: ${err.message}`)
                                        })
                                })
                                .catch(err => this._logger.error(`Error at publish sleep: ${err.message}`))
                            this._logger.info(`Sleep data received from ${userId} from ${sleepList[0].start_time}.`)
                        }
                    }
                }).catch(err => reject(err))
        })
    }

    private saveResourceList(resources: Array<any>, userId: string): Promise<Array<Resource>> {
        return new Promise<Array<Resource>>(async (resolve, reject) => {
            const result: Array<Resource> = []
            if (!resources || !resources.length) return result
            try {
                for await (const item of resources) {
                    const resource: Resource = await this._resourceRepo.create(new Resource().fromJSON({
                        resource_id: item.logId,
                        date_sync: new Date().toISOString(),
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

    public publishFitbitAuthError(data: FitbitAuthData, err: any, userId: string): void {
        /*
        * Publish Error according to the type.
        * Mapped Error Codes:
        *
        * 1011 - Expired Token
        * 1012 - Invalid Token
        * 1021 - Invalid Refresh Token
        * 1151 - Too Many Requests
        * 1500 - Unknown Error
        *
        */
        switch (err.type) {
            case 'expired_token':
                this._eventBus.bus.pubFitbitAuthError({
                    child_id: userId,
                    error: {
                        code: 1011,
                        message: `Expired access token: ${data.access_token}`,
                        description: 'The provided token was expired.'
                    }
                })
                break
            case 'invalid_token':
                this._eventBus.bus.pubFitbitAuthError({
                    child_id: userId,
                    error: {
                        code: 1011,
                        message: `Expired access token: ${data.access_token}`,
                        description: 'The provided token was expired.'
                    }
                })
                break
            case 'system':
                this._eventBus.bus.pubFitbitAuthError({
                    child_id: userId,
                    error: {
                        code: 1151,
                        message: `Data request limit for user has expired: ${userId}.`,
                        description: 'Please wait a minimum of one hour and try again.'
                    }
                })
                break
            default:
                this._eventBus.bus.pubFitbitAuthError({
                    child_id: userId,
                    error: {
                        code: 1500,
                        message: `An internal error has occurred in Fitbit Client.`,
                        description: 'Please wait a minimum of one hour and try again.'
                    }
                })
                break
        }
    }

    // MongoDb Error Listener
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
