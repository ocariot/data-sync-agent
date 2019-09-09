import { FitbitAuthData } from '../domain/model/fitbit.auth.data'

export interface IFitbitAuthDataRepository {
    updateLastSync(userId: string, lastSync: string): Promise<boolean>

    revokeToken(accessToken: string): Promise<boolean>

    refreshToken(userId: string, accessToken: string, refreshToken: string, expiresIn?: number): Promise<FitbitAuthData>

    syncFitbitUserData(data: FitbitAuthData, lastSync: string, calls: number, userId: string): Promise<void>

    syncLastFitbitUserData(data: FitbitAuthData, userId: string, type: string, date: string): Promise<void>

    subscribeUserEvent(data: FitbitAuthData, resource: string, subscriptionId: string): Promise<void>

    unsubscribeUserEvent(data: FitbitAuthData, resource: string, subscriptionId: string): Promise<void>

    getTokenPayload(token: string): Promise<any>
}
