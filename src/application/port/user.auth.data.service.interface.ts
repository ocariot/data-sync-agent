import { UserAuthData } from '../domain/model/user.auth.data'
import { IService } from './service.interface'
import { FitbitAuthData } from '../domain/model/fitbit.auth.data'
import { DataSync } from '../domain/model/data.sync'

export interface IUserAuthDataService extends IService<UserAuthData> {
    addFitbitAuthData(data: UserAuthData, initSync: string): Promise<UserAuthData>

    revokeFitbitAccessToken(userId: string): Promise<boolean>

    syncFitbitUserData(userId: string): Promise<DataSync>

    syncLastFitbitUserData(fitbitUserId: string, type: string, date: string): Promise<void>

    getFitbitAuthDataByUserId(userId: string): Promise<FitbitAuthData>
}
