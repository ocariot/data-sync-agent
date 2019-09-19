import { IFitbitClientRepository } from '../../../src/application/port/fitbit.client.repository.interface'
import { FitbitAuthData } from '../../../src/application/domain/model/fitbit.auth.data'
import { DefaultEntityMock } from '../models/default.entity.mock'

export class FitbitClientRepositoryMock implements IFitbitClientRepository {
    public getDataFromPath(path: string, accessToken: string): Promise<any> {
        if (accessToken === 'expired') {
            return Promise.reject({ type: 'expired_token' })
        }
        const type: string = path.split('/')[1]
        if (type === 'body') {
            return Promise.resolve({ weight: [DefaultEntityMock.FITBIT_WEIGHT] })
        }
        return Promise.resolve()
    }

    public refreshToken(accessToken: string, refreshToken: string, expiresIn?: number): Promise<any> {
        if (accessToken === 'error') return Promise.reject({ message: 'An error occurs!' })
        if (accessToken !== DefaultEntityMock.FITBIT_AUTH_DATA.access_token) return Promise.resolve(undefined)
        return Promise.resolve(DefaultEntityMock.FITBIT_AUTH_DATA)
    }

    public revokeToken(accessToken: string): Promise<boolean> {
        if (accessToken === 'error') return Promise.reject({ message: 'An error occurs!' })
        return Promise.resolve(true)
    }

    public subscribeUserEvent(data: FitbitAuthData, resource: string, subscriptionId: string): Promise<void> {
        if (resource === 'error') return Promise.reject({ message: 'An error occurs!' })
        return Promise.resolve()
    }

    public unsubscribeUserEvent(data: FitbitAuthData, resource: string, subscriptionId: string): Promise<void> {
        if (resource === 'error') return Promise.reject({ message: 'An error occurs!' })
        return Promise.resolve()
    }
}
