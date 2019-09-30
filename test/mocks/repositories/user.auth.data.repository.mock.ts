import { IUserAuthDataRepository } from '../../../src/application/port/user.auth.data.repository.interface'
import { IQuery } from '../../../src/application/port/query.interface'
import { UserAuthData } from '../../../src/application/domain/model/user.auth.data'
import { DefaultEntityMock } from '../models/default.entity.mock'

const data: UserAuthData = new UserAuthData().fromJSON(DefaultEntityMock.USER_AUTH_DATA)

export class UserAuthDataRepositoryMock implements IUserAuthDataRepository {
    public checkUserExists(userId: string): Promise<boolean> {
        return Promise.resolve(userId !== DefaultEntityMock.USER_IDS.does_not_exists)
    }

    public count(query: IQuery): Promise<number> {
        return Promise.resolve(1)
    }

    public create(item: UserAuthData): Promise<UserAuthData> {
        return Promise.resolve(data)
    }

    public delete(id: string): Promise<boolean> {
        return Promise.resolve(true)
    }

    public deleteByQuery(query: IQuery): Promise<boolean> {
        return Promise.resolve(true)
    }

    public find(query: IQuery): Promise<Array<UserAuthData>> {
        return Promise.resolve([data])
    }

    public findOne(query: IQuery): Promise<UserAuthData> {
        const q: any = query.toJSON()
        if (q.filters.user_id === DefaultEntityMock.USER_IDS.does_not_saved ||
            q.filters['fitbit.user_id'] === DefaultEntityMock.FITBIT_USER_IDS.does_not_saved) {
            return Promise.resolve(undefined!)
        }
        return Promise.resolve(data)
    }

    public update(item: UserAuthData): Promise<UserAuthData> {
        return Promise.resolve(data)
    }

    public getUserAuthDataByUserId(userId: string): Promise<UserAuthData> {
        if (userId === DefaultEntityMock.USER_IDS.does_not_exists) return Promise.resolve(undefined!)
        else if (userId === DefaultEntityMock.USER_IDS.expired_token) {
            const result: UserAuthData = new UserAuthData().fromJSON(DefaultEntityMock.USER_AUTH_DATA)
            result.fitbit!.status = 'expired_token'
            return Promise.resolve(result)
        } else if (userId === DefaultEntityMock.USER_IDS.invalid_token) {
            const result: UserAuthData = new UserAuthData().fromJSON(DefaultEntityMock.USER_AUTH_DATA)
            result.fitbit!.status = 'invalid_token'
            return Promise.resolve(result)
        }
        return Promise.resolve(data)
    }
}
