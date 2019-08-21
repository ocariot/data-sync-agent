import { IRepository } from './repository.interface'
import { FitbitAuthData } from '../domain/model/fitbit.auth.data'

export interface IFitbitAuthDataRepository extends IRepository<FitbitAuthData> {
    getAuthorizeUrl(userId: string, redirectUri: string): Promise<string>

    getAccessToken(userId: string, code: string): Promise<FitbitAuthData>

    revokeToken(accessToken: string): Promise<boolean>

    findAuthDataFromUser(userId: string): Promise<FitbitAuthData>
}
