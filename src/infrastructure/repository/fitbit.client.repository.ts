import FitbitApiClient from 'fitbit-node'
import { OAuthException } from '../../application/domain/exception/oauth.exception'
import { FitbitAuthData } from '../../application/domain/model/fitbit.auth.data'
import { injectable } from 'inversify'
import { IFitbitClientRepository } from '../../application/port/fitbit.client.repository.interface'
import { FitbitClientException } from '../../application/domain/exception/fitbit.client.exception'

@injectable()
export class FitbitClientRepository implements IFitbitClientRepository {

    private fitbit_client: any

    constructor() {
        this.fitbit_client = new FitbitApiClient({
            clientId: process.env.FITBIT_CLIENT_ID,
            clientSecret: process.env.FITBIT_CLIENT_SECRET,
            apiVersion: '1.2'
        })
    }

    public revokeToken(accessToken: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.fitbit_client.revokeAccessToken(accessToken)
                .then(res => resolve(!!res))
                .catch(err => reject(this.fitbitClientErrorListener(err)))
        })
    }

    public refreshToken(accessToken: string, refreshToken: string, expiresIn?: number): Promise<any> {
        return new Promise<FitbitAuthData>(async (resolve, reject) => {
            this.fitbit_client.refreshAccessToken(accessToken, refreshToken, expiresIn)
                .then(tokenData => resolve(tokenData ? tokenData : undefined))
                .catch(err => reject(this.fitbitClientErrorListener(err)))
        })
    }

    public getDataFromPath(path: string, accessToken: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.fitbit_client.get(path, accessToken)
                .then(data => {
                    if (data[0].errors) {
                        return reject(this.fitbitClientErrorListener(data[0].errors[0]))
                    }
                    return resolve(data[0])
                })
                .catch(err => reject(this.fitbitClientErrorListener(err)))
        })
    }

    public async subscribeUserEvent(data: FitbitAuthData, resource: string, subscriptionId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.fitbit_client
                .post(
                    `/${resource}/apiSubscriptions/${subscriptionId}-${data.user_id}.json`, // Path
                    data.access_token, // Access Token
                    null, // Form Data
                    null, // User Id
                    { 'X-Fitbit-Subscriber-Id': process.env.FITBIT_SUBSCRIBER_ID } // Extra Header
                )
                .then(res => {
                    if (res[0].errors) {
                        return reject(this.fitbitClientErrorListener(res[0].errors[0]))
                    }
                    return resolve()
                }).catch(err => reject(this.fitbitClientErrorListener(err)))
        })
    }

    public async unsubscribeUserEvent(data: FitbitAuthData, resource: string, subscriptionId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.fitbit_client
                .delete(
                    `/${resource}/apiSubscriptions/${subscriptionId}-${data.user_id}.json`, // Path
                    data.access_token, // Access Token
                    null, // User Id
                    { 'X-Fitbit-Subscriber-Id': process.env.FITBIT_SUBSCRIBER_ID } // Extra Header
                )
                .then(res => {
                    if (res[0] && res[0].errors) {
                        return reject(this.fitbitClientErrorListener(res[0].errors[0]))
                    }
                    return resolve()
                }).catch(err => reject(this.fitbitClientErrorListener(err)))
        })
    }

    private fitbitClientErrorListener(err: any): OAuthException | FitbitClientException | undefined {
        if (err.context) return new OAuthException(err.context.errors[0].errorType, err.context.errors[0].message)
        else if (err.code === 'EAI_AGAIN') return new FitbitClientException('client_error', err.message)
        return new OAuthException(err.errorType, err.message)
    }
}
