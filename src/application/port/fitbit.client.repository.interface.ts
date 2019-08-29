import { FitbitAuthData } from '../domain/model/fitbit.auth.data'

export interface IFitbitClientRepository {
    revokeToken(accessToken: string): Promise<boolean>

    refreshToken(accessToken: string, refreshToken: string, expiresIn?: number): Promise<FitbitAuthData>

    getDataFromPath(path: string, accessToken: string): Promise<any>

    subscribeUserEvent(data: FitbitAuthData, resource: string, subscriptionId: string): Promise<void>
}
