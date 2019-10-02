import { UserAuthData } from '../domain/model/user.auth.data'
import { IService } from './service.interface'
import { DataSync } from '../domain/model/data.sync'

export interface IUserAuthDataService extends IService<UserAuthData> {
    getByUserId(userId: string): Promise<UserAuthData>

    revokeFitbitAccessToken(userId: string): Promise<boolean>

    syncFitbitDataFromUser(userId: string): Promise<DataSync>

    syncLastFitbitUserData(fitbitUserId: string, type: string, date: string): Promise<void>
}
