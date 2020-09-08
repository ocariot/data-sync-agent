import FitbitApiClient from 'fitbit-node'
import { FitbitAuthData } from '../../application/domain/model/fitbit.auth.data'
import { injectable } from 'inversify'
import { IFitbitClientRepository } from '../../application/port/fitbit.client.repository.interface'
import { FitbitClientException } from '../../application/domain/exception/fitbit.client.exception'
import request from 'request'

@injectable()
export class FitbitClientRepository implements IFitbitClientRepository {
    private readonly fitbit_api_host: string
    private fitbit_client: any

    constructor() {
        this.fitbit_api_host = 'https://api.fitbit.com'
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

    public getTokenIntrospect(token: string): Promise<boolean> {
        return new Promise<any>((resolve, reject) => {
            request({
                url: `${this.fitbit_api_host}/1.1/oauth2/introspect`,
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                form: { token },
                json: true
            }, (err, res, body) => {
                return resolve(!!body?.active)
            })
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

    private fitbitClientErrorListener(err: any, accessToken?: string, refreshToken?: string): FitbitClientException | undefined {
        if (err.context?.errors) {
            return new FitbitClientException(err.context.errors[0].errorType, err.context.errors[0].message)
        } else if (err.code && err.code === 'EAI_AGAIN') {
            return new FitbitClientException(
                'client_error',
                'Could not connect with the Fitbit Server',
                'Please try again later.')
        }
        return new FitbitClientException(err.errorType, err.message)
    }
}
