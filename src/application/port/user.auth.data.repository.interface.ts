import { IRepository } from './repository.interface'
import { UserAuthData } from '../domain/model/user.auth.data'
import { IQuery } from './query.interface'

export interface IUserAuthDataRepository extends IRepository<UserAuthData> {
    checkUserExists(userId: string): Promise<boolean>

    deleteByQuery(query: IQuery): Promise<boolean>

    getUserAuthDataByUserId(userId: string): Promise<UserAuthData>
}
