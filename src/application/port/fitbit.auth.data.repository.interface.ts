import { IRepository } from './repository.interface'
import { FitbitAuthData } from '../domain/model/fitbit.auth.data'

export interface IFitbitAuthDataRepository extends IRepository<FitbitAuthData> {
}
