import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { UserAuthData } from '../../../src/application/domain/model/user.auth.data'
import { FitbitAuthData } from '../../../src/application/domain/model/fitbit.auth.data'

describe('Models: UserAuthData', () => {
    describe('fromJSON()', () => {
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: UserAuthData = new UserAuthData().fromJSON(DefaultEntityMock.USER_AUTH_DATA)
                assert.propertyVal(res, 'id', DefaultEntityMock.USER_AUTH_DATA.id)
                assert.propertyVal(res, 'user_id', DefaultEntityMock.USER_AUTH_DATA.user_id)
                assert.deepPropertyVal(res, 'fitbit',
                    new FitbitAuthData().fromJSON(DefaultEntityMock.USER_AUTH_DATA.fitbit))
            })
        })
        context('when convert a json string into a model', () => {
            it('should return a model', () => {
                const res: UserAuthData = new UserAuthData().fromJSON(JSON.stringify(DefaultEntityMock.USER_AUTH_DATA))
                assert.propertyVal(res, 'id', DefaultEntityMock.USER_AUTH_DATA.id)
                assert.propertyVal(res, 'user_id', DefaultEntityMock.USER_AUTH_DATA.user_id)
                assert.deepPropertyVal(res, 'fitbit',
                    new FitbitAuthData().fromJSON(DefaultEntityMock.USER_AUTH_DATA.fitbit))
            })
        })
        context('when json is invalid', () => {
            it('should return undefined parameters for undefined json', () => {
                const res: UserAuthData = new UserAuthData().fromJSON(undefined)
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'user_id', undefined)
                assert.propertyVal(res, 'fitbit', undefined)
            })
            it('should return undefined parameters for empty json', () => {
                const res: UserAuthData = new UserAuthData().fromJSON({})
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'user_id', undefined)
                assert.propertyVal(res, 'fitbit', undefined)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: UserAuthData = new UserAuthData().fromJSON('')
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'user_id', undefined)
                assert.propertyVal(res, 'fitbit', undefined)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: UserAuthData = new UserAuthData().fromJSON('invalid')
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'user_id', undefined)
                assert.propertyVal(res, 'fitbit', undefined)
            })
        })
    })

    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: UserAuthData = new UserAuthData().fromJSON(DefaultEntityMock.USER_AUTH_DATA)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.USER_AUTH_DATA_BEFORE)
            })
        })
        context('when the model parameters are undefined', () => {
            it('should return a json with undefined parameters', () => {
                const model: UserAuthData = new UserAuthData().fromJSON({})
                const res: any = model.toJSON()
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'user_id', undefined)
                assert.propertyVal(res, 'fitbit', undefined)
            })
        })
    })
})
