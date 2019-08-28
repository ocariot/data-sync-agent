import { IQuery } from '../port/query.interface'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IUserAuthDataRepository } from '../port/user.auth.data.repository.interface'
import { UserAuthData } from '../domain/model/user.auth.data'
import { IUserAuthDataService } from '../port/user.auth.data.service.interface'
import { CreateUserAuthDataValidator } from '../domain/validator/create.user.auth.data.validator'

@injectable()
export class UserAuthDataService implements IUserAuthDataService {
    constructor(
        @inject(Identifier.USER_AUTH_DATA_REPOSITORY) private readonly _userAuthDataRepo: IUserAuthDataRepository
    ) {
    }

    public async add(item: UserAuthData): Promise<UserAuthData> {
        try {
            CreateUserAuthDataValidator.validate(item)
            const exists: UserAuthData = await this._userAuthDataRepo.getAuthDataFromUser(item.user_id!)
            if (exists) {
                item.id = exists.id
                const result: UserAuthData = await this._userAuthDataRepo.update(item)
                return Promise.resolve(result)
            }
            const authData: UserAuthData = await this._userAuthDataRepo.create(item)
            return Promise.resolve(authData)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public getAll(query: IQuery): Promise<Array<UserAuthData>> {
        throw Error('Not implemented!')
    }

    public getById(id: string, query: IQuery): Promise<UserAuthData> {
        throw Error('Not implemented!')
    }

    public remove(id: string): Promise<boolean> {
        throw Error('Not implemented!')
    }

    public update(item: UserAuthData): Promise<UserAuthData> {
        throw Error('Not implemented!')
    }

    public getAuthorizeUrl(userId: string, redirectUri: string): Promise<string> {
        throw Error('Not implemented!')
    }

    public async getAccessToken(userId: string, code: string): Promise<UserAuthData> {
        throw Error('Not implemented!')
    }

    public refreshToken(accessToken: string, refreshToken: string, params?: any): Promise<UserAuthData> {
        throw Error('Not implemented!')
    }

    public revokeFitbitAccessToken(userId: string): Promise<boolean> {
        throw Error('Not implemented!')
    }

    public revokeToken(accessToken: string): Promise<boolean> {
        throw Error('Not implemented!')
    }

}
