import { FitbitAuthData } from '../domain/model/fitbit.auth.data'

export interface IFitbitAuthDataRepository {
    revokeToken(accessToken: string): Promise<boolean>

    refreshToken(userId: string, accessToken: string, refreshToken: string, expiresIn?: number): Promise<FitbitAuthData>

    syncFitbitUserData(data: FitbitAuthData, lastSync: string, calls: number): Promise<void>

    syncLastFitbitUserData(data: FitbitAuthData, userId: string, type: string, date: string): Promise<void>

    subscribeUserEvent(data: FitbitAuthData, resource: string, subscriptionId: string): Promise<void>
}
