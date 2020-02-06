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

    getTokenPayload(token: string): Promise<any>
}
