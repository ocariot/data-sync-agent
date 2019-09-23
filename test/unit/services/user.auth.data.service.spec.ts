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

describe('Services: UserAuthDataService', () => {
    const data: UserAuthData = new UserAuthData().fromJSON(DefaultEntityMock.USER_AUTH_DATA)
    const fitbit: FitbitAuthData = new FitbitAuthData().fromJSON(DefaultEntityMock.USER_AUTH_DATA.fitbit)
    const service: IUserAuthDataService =
        new UserAuthDataService(new UserAuthDataRepositoryMock(), new FitbitDataRepositoryMock(), new CustomLoggerMock())

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
    describe('addFitbitAuthData()', () => {
        context('when save a user auth data and sync the data', () => {
            it('should return the data', () => {
                return service.addFitbitAuthData(data, 'true')
                    .then(res => {
                        assert.propertyVal(res, 'id', DefaultEntityMock.USER_AUTH_DATA.id)
                        assert.propertyVal(res, 'user_id', DefaultEntityMock.USER_AUTH_DATA.user_id)
                        assert.deepPropertyVal(res, 'fitbit', fitbit)
                    })
            })
        })
        context('when save a user auth data and no sync the data', () => {
            it('should return the data', () => {
                return service.addFitbitAuthData(data, 'false')
                    .then(res => {
                        assert.propertyVal(res, 'id', DefaultEntityMock.USER_AUTH_DATA.id)
                        assert.propertyVal(res, 'user_id', DefaultEntityMock.USER_AUTH_DATA.user_id)
                        assert.deepPropertyVal(res, 'fitbit', fitbit)
                    })
            })
        })
        context('when there are validation errors', () => {
            it('should reject an error', () => {
                return service.addFitbitAuthData(new UserAuthData(), 'false')
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Required fields were not provided...')
                        assert.propertyVal(err, 'description', 'User Auth Validation: user_id required!')
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
    describe('syncFitbitUserData()', () => {
        context('when sync the fitbit user data', () => {
            it('should return void', () => {
                return service.syncFitbitUserData(data.user_id!)
                    .then(res => {
                        assert.isEmpty(res)
                    })
            })
        })

        context('when the user does not exists', () => {
            it('should throw an error', () => {
                return service.syncFitbitUserData(DefaultEntityMock.USER_IDS.does_not_saved)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'User does not have authentication data. ' +
                            'Please, submit authentication data and try again.')
                    })
            })
        })
        context('when there are validation errors', () => {
            it('should reject an error', () => {
                return service.syncFitbitUserData('123')
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'Some ID provided does not have a valid format!')
                        assert.propertyVal(err, 'description',
                            'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.')
                    })
            })
        })
    })
    describe('syncLastFitbitUserData()', () => {
        context('when sync the last fitbit user data', () => {
            it('should return undefined', () => {
                return service
                    .syncLastFitbitUserData(data.fitbit!.user_id!, 'weight', moment().format('YYYY-MM-DD'))
                    .then(res => {
                        assert.isUndefined(res)
                    })
            })
        })
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
