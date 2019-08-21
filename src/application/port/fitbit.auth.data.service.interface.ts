import { IOAuthServiceInterface } from './oauth.service.interface'

export interface IFitbitAuthDataService<FitbitAuthData> extends IOAuthServiceInterface<FitbitAuthData> {
    revokeTokenFromUser(userId: string): Promise<boolean>
}
