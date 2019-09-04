import { IRepository } from './repository.interface'
import { UserAuthData } from '../domain/model/user.auth.data'

export interface IUserAuthDataRepository extends IRepository<UserAuthData> {
}
