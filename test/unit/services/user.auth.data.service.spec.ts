import { UserAuthData } from '../../../src/application/domain/model/user.auth.data'
import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { UserAuthDataService } from '../../../src/application/service/user.auth.data.service'
import { UserAuthDataRepositoryMock } from '../../mocks/repositories/user.auth.data.repository.mock'
import { FitbitDataRepositoryMock } from '../../mocks/repositories/fitbit.data.repository.mock'
import { IUserAuthDataService } from '../../../src/application/port/user.auth.data.service.interface'
import { assert } from 'chai'
import { FitbitAuthData } from '../../../src/application/domain/model/fitbit.auth.data'
import { Query } from '../../../src/infrastructure/repository/query/query'
import moment = require('moment')
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { EventBusRabbitMQMock } from '../../mocks/eventbus/eventbus.rabbitmq.mock'
import { DataSync } from '../../../src/application/domain/model/data.sync'

describe('Services: UserAuthDataService', () => {
    const data: UserAuthData = new UserAuthData().fromJSON(DefaultEntityMock.USER_AUTH_DATA)
    const fitbit: FitbitAuthData = new FitbitAuthData().fromJSON(DefaultEntityMock.USER_AUTH_DATA.fitbit)
    const dataSync: DataSync = new DataSync().fromJSON(DefaultEntityMock.DATA_SYNC)
    const service: IUserAuthDataService =
        new UserAuthDataService(
            new UserAuthDataRepositoryMock(),
            new FitbitDataRepositoryMock(),
            new EventBusRabbitMQMock(),
            new CustomLoggerMock())

    describe('add()', () => {
        context('when save a data', () => {
            it('should return the saved data', () => {
                return service.add(data)
                    .then(res => {
                        assert.propertyVal(res, 'id', DefaultEntityMock.USER_AUTH_DATA.id)
                        assert.propertyVal(res, 'user_id', DefaultEntityMock.USER_AUTH_DATA.user_id)
                        assert.deepPropertyVal(res, 'fitbit', fitbit)
                    })
            })
        })
        context('when there are validation errors', () => {
            it('should reject an error', () => {
                return service.add(new UserAuthData())
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'User Auth Validation: user_id required!')
                    })
            })
        })
        context('when the user does not exists', () => {
            it('should throw an error', () => {
                data.user_id = DefaultEntityMock.USER_IDS.does_not_exists
                return service.add(data)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'The user does not have register on platform: ' +
                            DefaultEntityMock.USER_IDS.does_not_exists)
                        data.user_id = DefaultEntityMock.USER_AUTH_DATA.user_id
                    })
            })
        })
        context('when the auth data already exists', () => {
            it('should update and return the data', () => {
                data.user_id = DefaultEntityMock.USER_IDS.does_not_saved
                return service.add(data)
                    .then(res => {
                        assert.propertyVal(res, 'id', DefaultEntityMock.USER_AUTH_DATA.id)
                        assert.propertyVal(res, 'user_id', DefaultEntityMock.USER_AUTH_DATA.user_id)
                        assert.deepPropertyVal(res, 'fitbit', fitbit)
                        data.user_id = DefaultEntityMock.USER_AUTH_DATA.user_id
                    })
            })
        })
    })
    describe('getAll()', () => {
        it('should throw an error for not implemented', () => {
            try {
                service.getAll(new Query())
            } catch (err) {
                assert.propertyVal(err, 'message', 'Not implemented!')
            }
        })
    })
    describe('getById()', () => {
        it('should throw an error for not implemented', () => {
            try {
                service.getById('123', new Query())
            } catch (err) {
                assert.propertyVal(err, 'message', 'Not implemented!')
            }
        })
    })
    describe('remove()', () => {
        it('should throw an error for not implemented', () => {
            try {
                service.remove('123')
            } catch (err) {
                assert.propertyVal(err, 'message', 'Not implemented!')
            }
        })
    })
    describe('update()', () => {
        it('should throw an error for not implemented', () => {
            try {
                service.update(data)
            } catch (err) {
                assert.propertyVal(err, 'message', 'Not implemented!')
            }
        })
    })
    describe('getByUserId()', () => {
        context('when get a data by user id', () => {
            it('should return the data', () => {
                return service.getByUserId(data.user_id!)
                    .then(res => {
                        assert.propertyVal(res, 'id', DefaultEntityMock.USER_AUTH_DATA.id)
                        assert.propertyVal(res, 'user_id', DefaultEntityMock.USER_AUTH_DATA.user_id)
                        assert.deepPropertyVal(res, 'fitbit', fitbit)
                    })
            })
        })
        context('when there are validation errors', () => {
            it('should reject an error', () => {
                return service.getByUserId('123')
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Some ID provided does not have a valid format!')
                        assert.propertyVal(err, 'description',
                            'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.')
                    })
            })
        })
    })
    describe('revokeFitbitAccessToken()', () => {
        context('when revoke the fitbit access token by user id', () => {
            it('should return true', () => {
                return service.revokeFitbitAccessToken(data.user_id!)
                    .then(res => {
                        assert.isTrue(res)
                    })
            })
        })
        context('when the user does not exists', () => {
            it('should return false', () => {
                return service.revokeFitbitAccessToken(DefaultEntityMock.USER_IDS.does_not_saved)
                    .then(res => {
                        assert.isFalse(res)
                    })
            })
        })
        context('when there are validation errors', () => {
            it('should reject an error', () => {
                return service.revokeFitbitAccessToken('123')
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Some ID provided does not have a valid format!')
                        assert.propertyVal(err, 'description',
                            'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.')
                    })
            })
        })
    })
    describe('syncFitbitDataFromUser()', () => {
        context('when sync fitbit data from user', () => {
            it('should return the data sync', () => {
                return service.syncFitbitDataFromUser(data.user_id!)
                    .then(res => {
                        assert.deepEqual(res, dataSync)
                    })
            })
        })
        context('when the user data does not exists', () => {
            it('should reject an error', () => {
                return service.syncFitbitDataFromUser(DefaultEntityMock.USER_IDS.does_not_exists)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'User does not have authentication data. ' +
                            'Please, submit authentication data and try again.')
                    })
            })
        })
        context('when the token has expired', () => {
            it('should reject an error', () => {
                return service.syncFitbitDataFromUser(DefaultEntityMock.USER_IDS.expired_token)
                    .catch(err => {
                        assert.propertyVal(err, 'type', 'expired_token')
                        assert.propertyVal(err, 'message', 'The token has expired')
                    })
            })
        })
        context('when the token is invalid', () => {
            it('should reject an error', () => {
                return service.syncFitbitDataFromUser(DefaultEntityMock.USER_IDS.invalid_token)
                    .catch(err => {
                        assert.propertyVal(err, 'type', 'invalid_token')
                        assert.property(err, 'message')
                        assert.propertyVal(err, 'description', 'Please make a new Fitbit Auth data and try again.')
                    })
            })
        })
        context('when the client us unavailable', () => {
            it('should reject an error', () => {
                return service.syncFitbitDataFromUser(DefaultEntityMock.USER_IDS.client_error)
                    .catch(err => {
                        assert.propertyVal(err, 'type', 'client_error')
                        assert.propertyVal(err, 'message', 'The Fitbit Client is unavailable')
                    })
            })
        })
        context('when another fitbit error occurs', () => {
            it('should reject an error', () => {
                return service.syncFitbitDataFromUser(DefaultEntityMock.USER_IDS.any_fitbit_error)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Any error occurs')
                    })
            })
        })
    })
    describe('syncLastFitbitUserData()', () => {
        context('when user does not exists', () => {
            it('should return undefined', () => {
                return service
                    .syncLastFitbitUserData('XXYYXX', 'weight', moment().format('YYYY-MM-DD'))
                    .then(res => {
                        assert.isUndefined(res)
                    })
            })
        })
    })
})
