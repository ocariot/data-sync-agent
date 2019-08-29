import { UserAuthData } from '../domain/model/user.auth.data'
import { IService } from './service.interface'

export interface IUserAuthDataService extends IService<UserAuthData> {
    revokeFitbitAccessToken(userId: string): Promise<boolean>

    syncUserData(userId: string): Promise<void>

    syncLastFitbitUserData(fitbitUserId: string, type: string, date: string): Promise<void>
}
