import { IFitbitDataRepository } from '../../../src/application/port/fitbit.auth.data.repository.interface'
import { FitbitAuthData } from '../../../src/application/domain/model/fitbit.auth.data'
import { DefaultEntityMock } from '../models/default.entity.mock'

const authData: FitbitAuthData = new FitbitAuthData().fromJSON(DefaultEntityMock.FITBIT_AUTH_DATA)

export class FitbitDataRepositoryMock implements IFitbitDataRepository {
    public getTokenPayload(token: string): Promise<any> {
        return Promise.resolve({
            aud: 'A1B23C',
            sub: 'ABC123',
            iss: 'Fitbit',
            typ: 'access_token',
            scopes: 'ract rsle rwei',
            exp: 1568162400,
            iat: 1568133600
        })
    }

    public refreshToken(userId: string, accessToken: string, refreshToken: string, expiresIn?: number):
        Promise<FitbitAuthData> {
        return Promise.resolve(authData)
    }

    public revokeToken(accessToken: string): Promise<boolean> {
        return Promise.resolve(true)
    }

    public subscribeUserEvent(data: FitbitAuthData, resource: string, subscriptionId: string): Promise<void> {
        return Promise.resolve()
    }

    public syncFitbitUserData(data: FitbitAuthData, lastSync: string, calls: number, userId: string): Promise<void> {
        return Promise.resolve()
    }

    public syncLastFitbitUserData(data: FitbitAuthData, userId: string, type: string, date: string, calls: number):
        Promise<void> {
        return Promise.resolve()
    }

    public unsubscribeUserEvent(data: FitbitAuthData, resource: string, subscriptionId: string): Promise<void> {
        return Promise.resolve()
    }

    public updateLastSync(userId: string, lastSync: string): Promise<boolean> {
        return Promise.resolve(true)
    }

}
