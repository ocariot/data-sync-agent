import { FitbitAuthData } from '../domain/model/fitbit.auth.data'
import { IQuery } from '../port/query.interface'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IFitbitAuthDataRepository } from '../port/fitbit.auth.data.repository.interface'
import { CreateFitbitAuthDataValidator } from '../domain/validator/create.fitbit.auth.data.validator'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { IFitbitAuthDataService } from '../port/fitbit.auth.data.service.interface'
import { ValidationException } from '../domain/exception/validation.exception'

@injectable()
export class FitbitAuthDataService implements IFitbitAuthDataService<FitbitAuthData> {
    constructor(
        @inject(Identifier.FITBIT_DATA_REPOSITORY) private readonly _fitbitAuthDataRepo: IFitbitAuthDataRepository
    ) {
    }

    public async add(item: FitbitAuthData): Promise<FitbitAuthData> {
        try {
            CreateFitbitAuthDataValidator.validate(item)
            const exists: FitbitAuthData = await this._fitbitAuthDataRepo.findAuthDataFromUser(item.user_id!)
            if (exists) {
                item.id = exists.id
                const result: FitbitAuthData = await this._fitbitAuthDataRepo.update(item)
                return Promise.resolve(result)
            }
            const authData: FitbitAuthData = await this._fitbitAuthDataRepo.create(item)
            return Promise.resolve(authData)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public getAll(query: IQuery): Promise<Array<FitbitAuthData>> {
        throw Error('Not implemented!')
    }

    public getById(id: string, query: IQuery): Promise<FitbitAuthData> {
        throw Error('Not implemented!')
    }

    public remove(id: string): Promise<boolean> {
        throw Error('Not implemented!')
    }

    public update(item: FitbitAuthData): Promise<FitbitAuthData> {
        throw Error('Not implemented!')
    }

    public getAuthorizeUrl(userId: string, redirectUri: string): Promise<string> {
        try {
            ObjectIdValidator.validate(userId)
            if (!redirectUri) {
                throw new ValidationException('A redirect uri is required to manage this operation!')
            }
        } catch (err) {
            return Promise.reject(err)
        }
        return this._fitbitAuthDataRepo.getAuthorizeUrl(userId, redirectUri)
    }

    public async getAccessToken(userId: string, code: string): Promise<FitbitAuthData> {
        try {
            ObjectIdValidator.validate(userId)
        } catch (err) {
            return Promise.reject(err)
        }
        const authData: FitbitAuthData = await this._fitbitAuthDataRepo.getAccessToken(userId, code)
        await this._fitbitAuthDataRepo.subscribeUserWeightEvent(authData)
        await this._fitbitAuthDataRepo.subscribeUserActivityEvent(authData)
        await this._fitbitAuthDataRepo.subscribeUserSleepEvent(authData)
        return this.add(authData)
    }

    public refreshToken(accessToken: string, refreshToken: string, params?: any): Promise<FitbitAuthData> {
        throw Error('Not implemented!')
    }

    public async revokeToken(accessToken: string): Promise<boolean> {
        return this._fitbitAuthDataRepo.revokeToken(accessToken)
    }

    public async revokeTokenFromUser(userId: string): Promise<boolean> {
        try {
            ObjectIdValidator.validate(userId)
            const authData: FitbitAuthData = await this._fitbitAuthDataRepo.findAuthDataFromUser(userId)
            if (authData && authData.access_token) return this.revokeToken(authData.access_token)
            return Promise.resolve(false)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}
