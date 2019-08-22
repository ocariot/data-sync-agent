import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { Query } from '../../infrastructure/repository/query/query'
import { ILogger } from '../../utils/custom.logger'
import { IConnectionDB } from '../../infrastructure/port/connection.db.interface'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { IFitbitAuthDataRepository } from '../../application/port/fitbit.auth.data.repository.interface'
import { FitbitAuthData } from '../../application/domain/model/fitbit.auth.data'
import moment from 'moment'
import { Weight } from '../../application/domain/model/weight'
import { MeasurementType } from '../../application/domain/model/measurement'
import { BodyFat } from '../../application/domain/model/body.fat'
import { PhysicalActivity } from '../../application/domain/model/physical.activity'
import { Sleep } from '../../application/domain/model/sleep'
import { OAuthException } from '../../application/domain/exception/oauth.exception'

@injectable()
export class CollectFitbitUserDataTask implements IBackgroundTask {
    constructor(
        @inject(Identifier.MONGODB_CONNECTION) private readonly _mongodb: IConnectionDB,
        @inject(Identifier.FITBIT_AUTH_DATA_REPOSITORY) private readonly _fitbitAuthDataRepo: IFitbitAuthDataRepository,
        @inject(Identifier.LOGGER) /*private*/ readonly _logger: ILogger
    ) {
    }

    public async run(): Promise<void> {
        this._mongodb.eventConnection.on('connected', async () => {
            await this.getFitbitUsersData()
        })
    }

    private async getFitbitUsersData(): Promise<void> {
        try {
            const usersData: Array<FitbitAuthData> = await this._fitbitAuthDataRepo.find(new Query())
            for await (const data of usersData) {
                await this.getFitbitUserData(data, 1)
            }
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private getFitbitUserData(data: FitbitAuthData, calls: number): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const weights: Array<any> =
                    await this.getUserBodyData(
                        data.access_token!,
                        MeasurementType.WEIGHT,
                        data.last_sync ? moment(data.last_sync).format('YYYY-MM-DD') :
                            moment().format('YYYY-MM-DD'), '1y')
                const bodyFats: Array<any> =
                    await this.getUserBodyData(
                        data.access_token!,
                        'fat',
                        data.last_sync ? moment(data.last_sync).format('YYYY-MM-DD') :
                            moment().format('YYYY-MM-DD'), '1y')
                const activities: Array<any> =
                    await this.getUserActivities(
                        data.access_token!,
                        100,
                        data.last_sync ? moment(data.last_sync).format('YYYY-MM-DD') :
                            moment().subtract(1, 'year').format('YYYY-MM-DD'))
                const sleep: Array<any> =
                    await this.getUserSleep(
                        data.access_token!,
                        100,
                        data.last_sync ? moment(data.last_sync).format('YYYY-MM-DD') :
                            moment().subtract(1, 'year').format('YYYY-MM-DD'))

                const weightList: Array<Weight> = await this.parseWeight(weights, data.user_id!)
                const bodyFatsList: Array<BodyFat> = await this.parseBodyFat(bodyFats, data.user_id!)
                const activitiesList: Array<PhysicalActivity> = await this.parseActivity(activities, data.user_id!)
                const sleepList: Array<Sleep> = await this.parseSleep(sleep, data.user_id!)

                // These data should be posted on rabbitmq
                weightList
                bodyFatsList
                activitiesList
                sleepList
            } catch (err) {
                if (err.type) {
                    if (err.type === 'expired_token') {
                        if (calls === 3) {
                            return reject(new OAuthException('invalid_token', `The token is not valid: ${data.access_token}`))
                        }
                        try {
                            await this._fitbitAuthDataRepo.refreshToken(data.user_id!, data.access_token!, data.refresh_token!)
                        } catch (err) {
                            return reject(err)
                        }
                        setTimeout(() => this.getFitbitUserData(data, calls + 1), 1000)
                    } else if (err.type === 'invalid_token') {
                        return reject(new OAuthException('invalid_token', `The token is not valid: ${data.access_token}`))
                    }
                    return reject(new OAuthException(err.type, err.message))
                }
                return reject(err)
            }
        })
    }

    private async getUserBodyData(token: string, resource: string, date: string, period: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.getUserData(`/body/${resource}/date/${date}/${period}.json`, token)
                .then(result => {
                    if (!result.success && result.errors) {
                        return reject(new OAuthException(result.errors[0].errorType, result.errors[0].message))
                    }
                    return resolve(result[resource === 'fat' ? 'body-fat' : 'body-weight'])
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
            this._fitbitAuthDataRepo.getDataFromUser(path, token)
                .then(result => resolve(result[0]))
                .catch(err => reject(err))
        })
    }

    private parseWeight(weights: Array<any>, userId: string): Array<Weight> {
        if (!weights) return ([])
        return weights.map(item => this.transform({
            instanceof: 'weight',
            type: MeasurementType.WEIGHT,
            timestamp: new Date(item.dateTime).toISOString(),
            value: item.value,
            unit: 'kg',
            child_id: userId
        }))
    }

    private parseBodyFat(bodyFats: Array<any>, userId: string): Array<BodyFat> {
        if (!bodyFats) return []
        return bodyFats.map(item => this.transform({
            instanceof: 'body_fat',
            type: MeasurementType.BODY_FAT,
            timestamp: new Date(item.dateTime).toISOString(),
            value: item.value,
            unit: '%',
            child_id: userId
        }))
    }

    private parseActivity(activities: Array<any>, userId: string): Array<PhysicalActivity> {
        if (!activities) return ([])
        return activities.map(item => this.transform({
            instanceof: 'physical_activity',
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
        return sleep.map(item => this.transform({
            instanceof: 'sleep',
            start_time: item.startTime,
            end_time: moment(item.startTime).add(item.duration, 'milliseconds').format(),
            duration: item.duration,
            type: item.type,
            pattern: {
                data_set: item.levels.data.map(value => {
                    return { start_time: value.startTime, name: value.level, duration: value.seconds }
                }),
                summary: this.getSleepSummary(item.levels.summary)
            },
            child_id: userId
        }))
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

    private transform(data: any): any {
        switch (data.instanceof) {
            case 'weight':
                return new Weight().fromJSON(data)
            case 'body_fat':
                return new BodyFat().fromJSON(data)
            case 'physical_activity':
                return new PhysicalActivity().fromJSON(data)
            case 'sleep':
                return new Sleep().fromJSON(data)
            default:
                throw new Error('Object not mapped!')
        }
    }

    public stop(): Promise<void> {
        return Promise.resolve()
    }
}
