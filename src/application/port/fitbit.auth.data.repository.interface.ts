import { IRepository } from './repository.interface'
import { FitbitAuthData } from '../domain/model/fitbit.auth.data'

export interface IFitbitAuthDataRepository extends IRepository<FitbitAuthData> {
    getAuthorizeUrl(userId: string, redirectUri: string): Promise<string>

    getAccessToken(userId: string, code: string): Promise<FitbitAuthData>

    revokeToken(accessToken: string): Promise<boolean>

    findAuthDataFromUser(userId: string): Promise<FitbitAuthData>

    refreshToken(userId: string, accessToken: string, refreshToken: string, expiresIn?: number): Promise<FitbitAuthData>

    getDataFromPath(path: string, accessToken: string): Promise<any>

    getFitbitUserData(data: FitbitAuthData, calls: number): Promise<void>

    subscribeUserWeightEvent(data: FitbitAuthData): Promise<void>

    subscribeUserActivityEvent(data: FitbitAuthData): Promise<void>

    subscribeUserSleepEvent(data: FitbitAuthData): Promise<void>
}
