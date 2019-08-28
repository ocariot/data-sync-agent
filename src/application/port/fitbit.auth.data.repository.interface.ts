import { IOAuthServiceInterface } from './oauth.service.interface'
import { FitbitAuthData } from '../domain/model/fitbit.auth.data'

export interface IFitbitAuthDataRepository extends IOAuthServiceInterface<FitbitAuthData> {
    revokeToken(accessToken: string): Promise<boolean>

    findAuthDataFromUser(userId: string): Promise<FitbitAuthData>

    refreshToken(userId: string, accessToken: string, refreshToken: string, expiresIn?: number): Promise<FitbitAuthData>

    getDataFromPath(path: string, accessToken: string): Promise<any>

    getFitbitUserData(data: FitbitAuthData, lastSync: string, calls: number): Promise<void>

    subscribeUserEvent(data: FitbitAuthData, resource: string, subscriptionId: string): Promise<void>
}
