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
import { FitbitAuthData } from '../domain/model/fitbit.auth.data'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { ILogger } from '../../utils/custom.logger'
import { DataSync } from '../domain/model/data.sync'
import { VerifyFitbitAuthValidator } from '../domain/validator/verify.fitbit.auth.validator'
import { IEventBus } from '../../infrastructure/port/eventbus.interface'

@injectable()
export class UserAuthDataService implements IUserAuthDataService {
    constructor(
        @inject(Identifier.USER_AUTH_DATA_REPOSITORY) private readonly _userAuthDataRepo: IUserAuthDataRepository,
        @inject(Identifier.FITBIT_DATA_REPOSITORY) private readonly _fitbitAuthDataRepo: IFitbitDataRepository,
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async add(item: UserAuthData): Promise<UserAuthData> {
        return new Promise<UserAuthData>(async (resolve, reject) => {
            try {
                const authData: UserAuthData = await this.manageFitbitAuthData(item)
                CreateUserAuthDataValidator.validate(item)
                let result: UserAuthData

                authData.fitbit!.status = 'valid_token'

                const alreadySaved: UserAuthData = await this._userAuthDataRepo
                    .findOne(new Query().fromJSON({ filters: { user_id: authData.user_id! } }))
                if (alreadySaved) {
                    authData.id = alreadySaved.id
                    result = await this._userAuthDataRepo.update(authData)
                } else {
                    result = await this._userAuthDataRepo.create(authData)
                }

                if (authData.fitbit && authData.fitbit.last_sync) {
                    this._eventBus.bus.pubFitbitLastSync({
                        child_id: authData.user_id,
                        last_sync: authData.fitbit.last_sync
                    })
                        .then(() => this._logger.info(`Last sync from ${authData.user_id} successful published!`))
                        .catch(err => this._logger.error(`Error at publish last sync: ${err.message}`))
                }
                return resolve(result)
            } catch (err) {
                return reject(err)
            }
        })
    }

    public getAll(query: IQuery): Promise<Array<UserAuthData>> {
        return this._userAuthDataRepo.find(query)
    }

    public getById(id: string, query: IQuery): Promise<UserAuthData> {
        return this._userAuthDataRepo.findOne(query)
    }

    public remove(id: string): Promise<boolean> {
        throw Error('Not implemented!')
    }

    public update(item: UserAuthData): Promise<UserAuthData> {
        throw Error('Not implemented!')
    }

    public getByUserId(userId: string): Promise<UserAuthData> {
        try {
            ObjectIdValidator.validate(userId)
        } catch (err) {
            return Promise.reject(err)
        }
        return this._userAuthDataRepo.findOne(new Query().fromJSON({ filters: { user_id: userId } }))
    }

    public revokeFitbitAccessToken(userId: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let authData: UserAuthData
            try {
                ObjectIdValidator.validate(userId)

                // 1. Check if user has authorization data saved.
                authData = await this._userAuthDataRepo
                    .findOne(new Query().fromJSON({ filters: { user_id: userId } }))
                if (!authData || !authData.fitbit || !authData.fitbit.access_token) {
                    return resolve()
                }

                // 2. Revokes Fitbit access token.
                const isRevoked: boolean = await this._fitbitAuthDataRepo.revokeToken(authData.fitbit.access_token)

                // 3. Remove Fitbit authorization data from local database.
                const isRemoved: boolean = await this._fitbitAuthDataRepo.removeFitbitAuthData(userId)

                // 4. Publish the Fitbit revoke event on the bus.
                if (isRevoked && isRemoved) {
                    this._eventBus.bus
                        .pubFitbitRevoke({ child_id: userId })
                        .then(() => this._logger.info(`Fitbit revoke event for child ${userId} successfully published!`))
                        .catch((err) => this._logger.error(`There was an error publishing Fitbit revoke event for child ${userId}. ${err.message}`))
                }
                return resolve()
            } catch (err) {
                if (err.type) {
                    if (err.type === 'expired_token') {
                        this._fitbitAuthDataRepo
                            .refreshToken(userId, authData!.fitbit!.access_token!, authData!.fitbit!.refresh_token!)
                            .then(async newToken => {
                                await this.revokeFitbitAccessToken(userId)
                                return resolve()
                            }).catch(err => {
                            if (err.type !== 'system') this.updateTokenStatus(userId, err.type)
                        })
                    }
                    this.publishFitbitAuthError(err, userId)
                }
                return resolve()
            }
        })
    }

    private syncFitbitData(data: FitbitAuthData, userId: string): Promise<DataSync> {
        try {
            VerifyFitbitAuthValidator.validate(data)
            return this._fitbitAuthDataRepo.syncFitbitData(data, userId)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async syncFitbitDataFromUser(userId: string): Promise<DataSync> {
        return new Promise<DataSync>((resolve, reject) => {
            try {
                ObjectIdValidator.validate(userId)
                this._userAuthDataRepo
                    .getUserAuthDataByUserId(userId)
                    .then(async data => {
                        if (!data || !data.fitbit) {
                            throw new ValidationException(
                                'User does not have authentication data. Please, submit authentication data and try again.'
                            )
                        }
                        try {
                            const result: DataSync = await this.syncFitbitData(data.fitbit!, userId)
                            return resolve(result)
                        } catch (err) {
                            if (err.type) {
                                if (err.type === 'expired_token') {
                                    this._fitbitAuthDataRepo
                                        .refreshToken(userId, data.fitbit!.access_token!, data.fitbit!.refresh_token!)
                                        .then(async newToken => {
                                            const result: DataSync = await this.syncFitbitData(newToken, userId)
                                            return resolve(result)
                                        }).catch(err => {
                                        if (err.type !== 'system') this.updateTokenStatus(userId, err.type)
                                        this.publishFitbitAuthError(err, userId)
                                        return reject(this.manageFitbitAuthError(err))
                                    })
                                } else if (err.type === 'client_error') {
                                    try {
                                        const result: DataSync = await this.syncFitbitData(data.fitbit, userId)
                                        return resolve(result)
                                    } catch (err) {
                                        if (err.type) return reject(this.manageFitbitAuthError(err))
                                        return reject(err)
                                    }
                                } else {
                                    if (err.type !== 'system') this.updateTokenStatus(userId, err.type)
                                    this.publishFitbitAuthError(err, userId)
                                    return reject(this.manageFitbitAuthError(err))
                                }
                            } else {
                                return reject(err)
                            }
                        }
                    })
                    .catch(reject)
            } catch (err) {
                return reject(err)
            }
        })
    }

    private async manageFitbitAuthData(data: UserAuthData): Promise<UserAuthData> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!data || !data.fitbit || !data.fitbit.access_token) {
                    return resolve(data)
                }
                const payload: any = await this._fitbitAuthDataRepo.getTokenPayload(data.fitbit!.access_token!)
                if (payload.sub) data.fitbit!.user_id = payload.sub
                if (payload.scopes) data.fitbit!.scope = payload.scopes
                if (payload.exp) data.fitbit!.expires_in = payload.exp
                data.fitbit!.token_type = 'Bearer'
                return resolve(data)
            } catch (err) {
                return reject(err)
            }
        })
    }

    private updateTokenStatus(userId: string, status: string): void {
        this._fitbitAuthDataRepo.updateTokenStatus(userId, status)
            .then()
            .catch(err => this._logger.error(`Error at update token status from ${userId}: ${err.message}`))
    }

    /*
   * Publish Error according to the type.
   * Mapped Error Codes:
   *
   * 1011 - Expired Token
   * 1012 - Invalid Token
   * 1021 - Invalid Refresh Token
   * 1401 - Invalid Client Credentials
   * 1429 - Too Many Requests
   * 1500 - Generic Error
   */
    private publishFitbitAuthError(error: any, userId: string): void {
        const fitbit: any = {
            child_id: userId,
            error: this.manageFitbitAuthError(error)
        }
        this._logger.error(`Fitbit error: ${JSON.stringify(fitbit)}`)
        this._eventBus.bus.pubFitbitAuthError(fitbit)
            .then(() => this._logger.info(`Error message about ${error.type} from ${userId} successful published!`))
            .catch(err => this._logger.error(`Error at publish error message from ${userId}: ${err.message}`))
    }

    private manageFitbitAuthError(error: any): any {
        const result: any = { code: 0, message: error.message, description: error.description }
        switch (error.type) {
            case 'expired_token':
                result.code = 1011 // 400
                break
            case 'invalid_token':
                result.code = 1012 // 400
                break
            case 'invalid_grant':
                result.code = 1021 // 400
                break
            case 'invalid_client': // 403
                result.code = 1401
                break
            case 'system':
                result.code = 1429 // 429
                break
            default:
                result.code = 1500 // 500
                break
        }
        return result
    }
}
