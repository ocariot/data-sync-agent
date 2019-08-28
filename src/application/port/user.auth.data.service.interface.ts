import { IOAuthServiceInterface } from './oauth.service.interface'
import { UserAuthData } from '../domain/model/user.auth.data'

export interface IUserAuthDataService extends IOAuthServiceInterface<UserAuthData> {
    revokeFitbitAccessToken(userId: string): Promise<boolean>
}
