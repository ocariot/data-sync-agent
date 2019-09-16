import { IQuery } from '../port/query.interface'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IUserAuthDataRepository } from '../port/user.auth.data.repository.interface'
import { UserAuthData } from '../domain/model/user.auth.data'
import { CreateUserAuthDataValidator } from '../domain/validator/create.user.auth.data.validator'
import { IFitbitDataRepository } from '../port/fitbit.auth.data.repository.interface'
import { IUserAuthDataService } from '../port/user.auth.data.service.interface'
import { Query } from '../../infrastructure/repository/query/query'
import { ValidationException } from '../domain/exception/validation.exception'
import { EventBusException } from '../domain/exception/eventbus.exception'

@injectable()
export class UserAuthDataService implements IUserAuthDataService {
    constructor(
        @inject(Identifier.USER_AUTH_DATA_REPOSITORY) private readonly _userAuthDataRepo: IUserAuthDataRepository,
        @inject(Identifier.FITBIT_DATA_REPOSITORY) private readonly _fitbitAuthDataRepo: IFitbitDataRepository
    ) {
    }

    public async add(item: UserAuthData): Promise<UserAuthData> {
        try {
            CreateUserAuthDataValidator.validate(item)
            const newItem: UserAuthData = await this.manageFitbitAuthData(item)
            newItem.fitbit!.is_valid = true
            const exists: boolean = await this._userAuthDataRepo.checkUserExists(newItem.user_id!)
            if (!exists) throw new ValidationException(`The user does not have register on platform: ${newItem.user_id!}`)
            const alreadySaved: UserAuthData =
                await this._userAuthDataRepo.findOne(new Query().fromJSON({ filters: { user_id: newItem.user_id! } }))
            if (alreadySaved) {
                newItem.id = alreadySaved.id
                const result: UserAuthData = await this._userAuthDataRepo.update(newItem)
                this.subscribeFitbitEvents(result)
                    .then()
                    .catch(err => Promise.reject(err))
                return Promise.resolve(result)
            }
            const authData: UserAuthData = await this._userAuthDataRepo.create(newItem)
            this.subscribeFitbitEvents(authData)
                .then()
                .catch(err => Promise.reject(err))
            return Promise.resolve(authData)
        } catch (err) {
            if (err.message.indexOf('rpc') !== -1) {
                return Promise.reject(new EventBusException(
                    'Communication with the message bus cannot be performed.',
                    'Probably, the message service is unavailable.'))
            }
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
                this._fitbitAuthDataRepo.syncFitbitUserData(result.fitbit!, result.fitbit!.last_sync!, 3, result.user_id!)
                    .then()
                    .catch(err => Promise.reject(err))
            }
            return Promise.resolve(result)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async revokeFitbitAccessToken(userId: string): Promise<boolean> {
        try {
            const authData: UserAuthData =
                await this._userAuthDataRepo.findOne(new Query().fromJSON({ filters: { user_id: userId } }))
            if (authData) await this._fitbitAuthDataRepo.revokeToken(authData.fitbit!.access_token!)
            return Promise.resolve(!!authData)
        } catch (err) {
            return Promise.reject(err)
        }
        throw Error('Not implemented!')
    }

    public async syncFitbitUserData(userId: string): Promise<void> {
        try {
            const authData: UserAuthData =
                await this._userAuthDataRepo.findOne(new Query().fromJSON({ filters: { user_id: userId } }))
            if (!authData || !authData.fitbit) {
                throw new ValidationException(
                    ' Error: User does not have authentication data. Please, submit authentication data and try again.')
            }
            this._fitbitAuthDataRepo.syncFitbitUserData(authData.fitbit!, authData.fitbit!.last_sync!, 1, userId)
                .then()
                .catch(err => Promise.reject(err))
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
                this._fitbitAuthDataRepo.syncLastFitbitUserData(authData.fitbit!, authData.user_id!, type, date, 1)
                    .then()
                    .catch()
            }
            return Promise.resolve()
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private async subscribeFitbitEvents(data: UserAuthData): Promise<void> {
        try {
            const scopes: Array<string> = data.fitbit!.scope!.split(' ')
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

    private async manageFitbitAuthData(data: UserAuthData): Promise<UserAuthData> {
        try {
            const payload: any = await this._fitbitAuthDataRepo.getTokenPayload(data.fitbit!.access_token!)
            if (payload.sub) data.fitbit!.user_id = payload.sub
            if (payload.scopes) data.fitbit!.scope = payload.scopes
            if (payload.exp) data.fitbit!.expires_in = payload.exp
            data.fitbit!.token_type = 'Bearer'
            return Promise.resolve(data)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}
