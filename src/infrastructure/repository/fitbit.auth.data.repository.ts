import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { FitbitAuthData } from '../../application/domain/model/fitbit.auth.data'
import FitbitApiClient from 'fitbit-node'
import { OAuthException } from '../../application/domain/exception/oauth.exception'
import moment from 'moment'
import { PhysicalActivity } from '../../application/domain/model/physical.activity'
import { Sleep } from '../../application/domain/model/sleep'
import { Log } from '../../application/domain/model/log'
import { UserLog } from '../../application/domain/model/user.log'
import { MeasurementType } from '../../application/domain/model/measurement'
import { Weight } from '../../application/domain/model/weight'
import { ResourceDataType } from '../../application/domain/utils/resource.data.type'
import { IFitbitAuthDataRepository } from '../../application/port/fitbit.auth.data.repository.interface'
import { FitbitAuthDataEntity } from '../entity/fitbit.auth.data.entity'

@injectable()
export class FitbitAuthDataRepository implements IFitbitAuthDataRepository {

    private fitbit_client: any
    private max_calls_refresh_token: number = 3 // Max calls to refresh a access token

    constructor(
        @inject(Identifier.USER_AUTH_REPO_MODEL) readonly _userAuthRepoModel: any,
        @inject(Identifier.FITBIT_AUTH_DATA_ENTITY_MAPPER)
        readonly _fitbitAuthEntityMapper: IEntityMapper<FitbitAuthData, FitbitAuthDataEntity>,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
        this.fitbit_client = new FitbitApiClient({
            clientId: process.env.FITBIT_CLIENT_ID,
            clientSecret: process.env.FITBIT_CLIENT_SECRET,
            apiVersion: '1.2'
        })
    }

    // Fitbit Client Methods
    public revokeToken(accessToken: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            this.fitbit_client.revokeAccessToken(accessToken)
                .then(res => resolve(!!res))
                .catch(err => reject(new OAuthException(err.context.errors[0].errorType, err.context.errors[0].message)))
        })
    }

    public refreshToken(userId: string, accessToken: string, refreshToken: string, expiresIn?: number): Promise<FitbitAuthData> {
        return new Promise<FitbitAuthData>(async (resolve, reject) => {
            this.fitbit_client.refreshAccessToken(accessToken, refreshToken, expiresIn)
                .then(async tokenData => {
                    if (!tokenData) return resolve(undefined)
                    return this._fitbitAuthEntityMapper.transform(tokenData)
                })
                .catch(err => {
                    return reject(new OAuthException(err.context.errors[0].errorType, err.context.errors[0].message))
                })
        })
    }

    public getDataFromPath(path: string, accessToken: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.fitbit_client.get(path, accessToken)
                .then(data => resolve(data ? data : undefined))
                .catch(err => reject(new OAuthException(err.context.errors[0].errorType, err.context.errors[0].message)))
        })
    }

    public async subscribeUserEvent(data: FitbitAuthData, resource: string, subscriptionId: string): Promise<void> {
        try {
            const subscription =
                await this.fitbit_client.post(`/${resource}/apiSubscriptions/${subscriptionId}.json`, data.access_token)
            if (subscription[0].errors) throw new Error()
            return Promise.resolve()
        } catch (err) {
            return Promise.reject(new OAuthException('subscribe_error', `Error at subscribe in ${resource} resource`))
        }
    }

    public getFitbitUserData(data: FitbitAuthData, lastSync: string, calls: number): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const weights: Array<any> = lastSync ?
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
                const activities: Array<any> =
                    await this.getUserActivities(
                        data.access_token!,
                        100,
                        lastSync ? moment(lastSync).format('YYYY-MM-DD') :
                            moment().subtract(6, 'month').format('YYYY-MM-DD'))
                const sleep: Array<any> =
                    await this.getUserSleep(
                        data.access_token!,
                        100,
                        lastSync ? moment(lastSync).format('YYYY-MM-DD') :
                            moment().subtract(6, 'month').format('YYYY-MM-DD'))

                const stepsLogs: Array<any> =
                    await this.getUserActivityLogs(
                        data.access_token!,
                        'steps',
                        lastSync ? moment(lastSync).format('YYYY-MM-DD') :
                            moment().subtract(6, 'month').format('YYYY-MM-DD'),
                        'today'
                    )

                const caloriesLogs: Array<any> =
                    await this.getUserActivityLogs(
                        data.access_token!,
                        'calories',
                        lastSync ? moment(lastSync).format('YYYY-MM-DD') :
                            moment().subtract(6, 'month').format('YYYY-MM-DD'),
                        'today'
                    )

                const minutesSedentaryLogs: Array<any> =
                    await this.getUserActivityLogs(
                        data.access_token!,
                        'minutesSedentary',
                        lastSync ? moment(lastSync).format('YYYY-MM-DD') :
                            moment().subtract(6, 'month').format('YYYY-MM-DD'),
                        'today'
                    )

                const minutesLightlyActiveLogs: Array<any> =
                    await this.getUserActivityLogs(
                        data.access_token!,
                        'minutesLightlyActive',
                        lastSync ? moment(lastSync).format('YYYY-MM-DD') :
                            moment().subtract(6, 'month').format('YYYY-MM-DD'),
                        'today'
                    )

                const minutesFairlyActiveLogs: Array<any> =
                    await this.getUserActivityLogs(
                        data.access_token!,
                        'minutesFairlyActive',
                        lastSync ? moment(lastSync).format('YYYY-MM-DD') :
                            moment().subtract(6, 'month').format('YYYY-MM-DD'),
                        'today'
                    )

                const minutesVeryActiveLogs: Array<any> =
                    await this.getUserActivityLogs(
                        data.access_token!,
                        'minutesVeryActive',
                        lastSync ? moment(lastSync).format('YYYY-MM-DD') :
                            moment().subtract(6, 'month').format('YYYY-MM-DD'),
                        'today'
                    )

                const weightList: Array<Weight> = await this.parseWeight(weights, data.user_id!)
                const activitiesList: Array<PhysicalActivity> = await this.parsePhysicalActivity(activities, data.user_id!)
                const sleepList: Array<Sleep> = await this.parseSleep(sleep, data.user_id!)
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
                lastSync = new Date().toISOString()
                // await this._fitbitAuthDataRepo.update(data)
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
                        setTimeout(() => this.getFitbitUserData(data, lastSync, calls + 1), 1000)
                    } else if (err.type === 'invalid_token') {
                        return reject(new OAuthException('invalid_token', `Access token invalid: ${data.access_token}`))
                    }
                    return reject(new OAuthException(err.type, err.message))
                }
                return reject(err)
            }
        })
    }

    public getResourceData(data: FitbitAuthData, type: string, date: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (type === ResourceDataType.BODY) {
                this.fitbit_client.get(`body/log/weight/date/${date}.json`)
            } else if (type === ResourceDataType.ACTIVITIES) {
                return
            } else if (type === ResourceDataType.SLEEP) {
                return
            }
        })
    }

    private async getUserActivityLogs(token: string, resource: string, baseDate: string, endDate: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.getUserData(`/activities/tracker/${resource}/date/${baseDate}/${endDate}.json`, token)
                .then(result => {
                    if (!result.success && result.errors) {
                        return reject(new OAuthException(result.errors[0].errorType, result.errors[0].message))
                    }
                    return resolve(result[`activities-tracker-${resource}`])
                }).catch(err => reject(err))
        })
    }

    private async getUserBodyDataFromInterval(token: string, baseDate: string, endDate: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.getUserData(`/body/log/weight/date/${baseDate}/${endDate}.json`, token)
                .then(result => {
                    if (!result.success && result.errors) {
                        return reject(new OAuthException(result.errors[0].errorType, result.errors[0].message))
                    }
                    return resolve(result.weight)
                }).catch(err => reject(err))
        })
    }

    private async getUserActivities(token: string, limit: number, afterDate: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const path: string = `/activities/list.json?afterDate=${afterDate}&sort=desc&offset=0&limit=${limit}`
            this.getUserData(path, token)
                .then(result => {
                    if (!result.success && result.errors) {
                        return reject(new OAuthException(result.errors[0].errorType, result.errors[0].message))
                    }
                    return resolve(result.activities)
                }).catch(err => reject(err))
        })
    }

    private async getUserSleep(token: string, limit: number, afterDate: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const path: string = `/sleep/list.json?afterDate=${afterDate}&sort=desc&offset=0&limit=${limit}`
            this.getUserData(path, token)
                .then(result => {
                    if (!result.success && result.errors) {
                        return reject(new OAuthException(result.errors[0].errorType, result.errors[0].message))
                    }
                    return resolve(result.sleep)
                }).catch(err => reject(err))
        })
    }

    private async getUserData(path: string, token: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.getDataFromPath(path, token)
                .then(result => resolve(result[0]))
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
    private parseWeight(weights: Array<any>, userId: string): Array<Weight> {
        if (!weights) return ([])
        return weights.map(item => new Weight().fromJSON({
            type: MeasurementType.WEIGHT,
            timestamp: new Date(item.date).toISOString(),
            value: item.value,
            unit: 'kg',
            body_fat: item.fat,
            child_id: userId
        }))
    }

    private parsePhysicalActivity(activities: Array<any>, userId: string): Array<PhysicalActivity> {
        if (!activities) return ([])
        return activities.map(item => new PhysicalActivity().fromJSON({
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
        }))
    }

    private parseSleep(sleep: Array<any>, userId: string): Array<Sleep> {
        if (!sleep) return ([])
        return sleep.map(item => new Sleep().fromJSON({
            start_time: item.startTime,
            end_time: moment(item.startTime).add(item.duration, 'milliseconds').format(),
            duration: item.duration,
            type: item.type,
            pattern: {
                data_set: item.levels.data.map(value => {
                    return { start_time: value.startTime, name: value.level, duration: `${parseInt(value.seconds, 10) * 1000}` }
                }),
                summary: this.getSleepSummary(item.levels.summary)
            },
            child_id: userId
        }))
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
}
