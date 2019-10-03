import { FitbitAuthData } from '../domain/model/fitbit.auth.data'
import { DataSync } from '../domain/model/data.sync'

export interface IFitbitDataRepository {
    removeFitbitAuthData(userId: string): Promise<boolean>

    updateLastSync(userId: string, lastSync: string): Promise<boolean>

    updateTokenStatus(userId: string, status: string): Promise<boolean>

    publishLastSync(userId: string, lastSync: string): void

    revokeToken(accessToken: string): Promise<boolean>

    refreshToken(userId: string, accessToken: string, refreshToken: string, expiresIn?: number): Promise<FitbitAuthData>

    syncFitbitData(data: FitbitAuthData, userId: string): Promise<DataSync>

    syncLastFitbitData(data: FitbitAuthData, userId: string, type: string, date: string): Promise<void>

    subscribeUserEvent(data: FitbitAuthData, resource: string, subscriptionId: string): Promise<void>

    unsubscribeUserEvent(data: FitbitAuthData, resource: string, subscriptionId: string): Promise<void>

    getTokenPayload(token: string): Promise<any>
}
