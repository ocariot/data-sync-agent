import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { BaseRepository } from './base/base.repository'
import { ILogger } from '../../utils/custom.logger'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { FitbitAuthData } from '../../application/domain/model/fitbit.auth.data'
import { FitbitAuthDataEntity } from '../entity/fitbit.auth.data.entity'
import { IFitbitAuthDataRepository } from '../../application/port/fitbit.auth.data.repository.interface'
import FitbitApiClient from 'fitbit-node'
import { Default } from '../../utils/default'
import { Query } from './query/query'
import { OAuthException } from '../../application/domain/exception/oauth.exception'

@injectable()
export class FitbitAuthDataRepository extends BaseRepository<FitbitAuthData, FitbitAuthDataEntity>
    implements IFitbitAuthDataRepository {

    private callback_url: string
    private fitbit_client: any

    constructor(
        @inject(Identifier.OAUTH_DATA_REPO_MODEL) readonly _fitbitAuthDataRepoModel: any,
        @inject(Identifier.FITBIT_AUTH_DATA_ENTITY_MAPPER)
        readonly _fitbitAuthDataEntityMapper: IEntityMapper<FitbitAuthData, FitbitAuthDataEntity>,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
        super(_fitbitAuthDataRepoModel, _fitbitAuthDataEntityMapper, _logger)
        this.callback_url = `${process.env.HOST_API || Default.HOST_API}/v1/fitbit/callback`
        this.fitbit_client = new FitbitApiClient({
            clientId: process.env.FITBIT_CLIENT_ID,
            clientSecret: process.env.FITBIT_CLIENT_SECRET,
            apiVersion: '1.2'
        })
    }

    public getAuthorizeUrl(userId: string, redirectUri: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                return resolve(
                    this.fitbit_client
                        .getAuthorizeUrl(
                            'activity heartrate weight sleep',
                            this.callback_url,
                            undefined,
                            `?user_id=${userId}&redirect_uri=${redirectUri}`))
            } catch (err) {
                return reject(new OAuthException(err.context.errors[0].errorType, err.context.errors[0].message))
            }
        })
    }

    public getAccessToken(userId: string, code: string): Promise<FitbitAuthData> {
        return new Promise<FitbitAuthData>((resolve, reject) => {
            this.fitbit_client.getAccessToken(code, this.callback_url)
                .then(tokenData => {
                    if (!tokenData) return resolve(undefined)
                    return resolve(this.mapper.transform({ ...tokenData, user_id: userId }))
                })
                .catch(err => {
                    return reject(new OAuthException(err.context.errors[0].errorType, err.context.errors[0].message))
                })
        })
    }

    public revokeToken(accessToken: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            this.fitbit_client.revokeAccessToken(accessToken)
                .then(res => resolve(!!res))
                .catch(err => {
                    return reject(new OAuthException(err.context.errors[0].errorType, err.context.errors[0].message))
                })
        })
    }

    public refreshToken(userId: string, accessToken: string, refreshToken: string, expiresIn?: number): Promise<FitbitAuthData> {
        return new Promise<FitbitAuthData>(async (resolve, reject) => {
            this.fitbit_client.refreshAccessToken(accessToken, refreshToken, expiresIn)
                .then(async tokenData => {
                    if (!tokenData) return resolve(undefined)
                    const savedAccessToken: FitbitAuthData = await this.findAuthDataFromUser(userId)
                    const newAccessToken: FitbitAuthData = new FitbitAuthData().fromJSON({ ...tokenData, user_id: userId })
                    newAccessToken.id = savedAccessToken.id
                    return resolve(this.update(newAccessToken))
                })
                .catch(err => {
                    return reject(new OAuthException(err.context.errors[0].errorType, err.context.errors[0].message))
                })
        })
    }

    public getDataFromUser(path: string, accessToken: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.fitbit_client.get(path, accessToken)
                .then(data => {
                    if (!data) return resolve(undefined)
                    return resolve(data)
                })
                .catch(err => {
                    return reject(new OAuthException(err.context.errors[0].errorType, err.context.errors[0].message))
                })
        })
    }

    public findAuthDataFromUser(userId: string): Promise<FitbitAuthData> {
        return this.findOne(new Query().fromJSON({ filters: { user_id: userId } }))
    }
}
