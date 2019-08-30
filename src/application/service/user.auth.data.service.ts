import { IQuery } from '../port/query.interface'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IUserAuthDataRepository } from '../port/user.auth.data.repository.interface'
import { UserAuthData } from '../domain/model/user.auth.data'
import { CreateUserAuthDataValidator } from '../domain/validator/create.user.auth.data.validator'
import { IFitbitAuthDataRepository } from '../port/fitbit.auth.data.repository.interface'
import { IUserAuthDataService } from '../port/user.auth.data.service.interface'
import { Query } from '../../infrastructure/repository/query/query'
import { ValidationException } from '../domain/exception/validation.exception'

@injectable()
export class UserAuthDataService implements IUserAuthDataService {
    constructor(
        @inject(Identifier.USER_AUTH_DATA_REPOSITORY) private readonly _userAuthDataRepo: IUserAuthDataRepository,
        @inject(Identifier.FITBIT_AUTH_DATA_REPOSITORY) private readonly _fitbitAuthDataRepo: IFitbitAuthDataRepository
    ) {
    }

    public async add(item: UserAuthData): Promise<UserAuthData> {
        try {
            CreateUserAuthDataValidator.validate(item)
            const exists: UserAuthData = await this._userAuthDataRepo.getAuthDataFromUser(item.user_id!)
            if (exists) {
                item.id = exists.id
                const result: UserAuthData = await this._userAuthDataRepo.update(item)
                this.subscribeFitbitEvents(result)
                return Promise.resolve(result)
            }
            const authData: UserAuthData = await this._userAuthDataRepo.create(item)
            this.subscribeFitbitEvents(authData)
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

    public async addFitbitAuthData(data: UserAuthData, initSync: string): Promise<UserAuthData> {
        try {
            const result: UserAuthData = await this.add(data)
            if (initSync !== 'false') {
                this._fitbitAuthDataRepo.syncFitbitUserData(result.fitbit!, result.fitbit!.last_sync!, 3)
            }
            return Promise.resolve(result)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async revokeFitbitAccessToken(userId: string): Promise<boolean> {
        try {
            const authData: UserAuthData = await this._userAuthDataRepo.getAuthDataFromUser(userId)
            if (authData) await this._fitbitAuthDataRepo.revokeToken(authData.fitbit!.access_token!)
            return Promise.resolve(!!authData)
        } catch (err) {
            return Promise.reject(err)
        }
        throw Error('Not implemented!')
    }

    public async syncFitbitUserData(userId: string): Promise<void> {
        try {
            const authData: UserAuthData = await this._userAuthDataRepo.getAuthDataFromUser(userId)
            if (!authData || !authData.fitbit) {
                throw new ValidationException(
                    ' Error: User does not have authentication data. Please, submit authentication data and try again.')
            }
            this._fitbitAuthDataRepo.syncFitbitUserData(authData.fitbit!, authData.fitbit!.last_sync!, 3)
            return Promise.resolve()
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async syncLastFitbitUserData(fitbitUserId: string, type: string, date: string): Promise<void> {
        try {
            const authData: UserAuthData =
                await this._userAuthDataRepo.findOne(new Query().fromJSON({ filters: { 'fitbit.user_id': fitbitUserId } }))
            if (authData) {
                await this._fitbitAuthDataRepo.syncLastFitbitUserData(authData.fitbit!, authData.user_id!, type, date)
            }
            return Promise.resolve()
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private async subscribeFitbitEvents(data: UserAuthData): Promise<void> {
        try {
            const payload: any = await this._fitbitAuthDataRepo.getTokenPayload(data.fitbit!.access_token!)
            const scopes: Array<string> = payload.scopes.split(' ')
            if (scopes.includes('rwei')) { // Scope reference from fitbit to weight data is rwei
                await this._fitbitAuthDataRepo.subscribeUserEvent(data.fitbit!, 'body', 'BODY')
            }
            if (scopes.includes('ract')) { // Scope reference from fitbit to activity data is ract
                await this._fitbitAuthDataRepo.subscribeUserEvent(data.fitbit!, 'activities', 'ACTIVITIES')
            }
            if (scopes.includes('rsle')) { // Scope reference from fitbit to sleep data is rsle
                await this._fitbitAuthDataRepo.subscribeUserEvent(data.fitbit!, 'sleep', 'SLEEP')
            }
        } catch (err) {
            return Promise.reject(err)
        }
    }

}
