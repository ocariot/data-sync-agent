import { IEntityMapper } from '../../../src/infrastructure/port/entity.mapper.interface'
import { FitbitAuthData } from '../../../src/application/domain/model/fitbit.auth.data'
import { FitbitAuthDataEntity } from '../../../src/infrastructure/entity/fitbit.auth.data.entity'
import { FitbitAuthDataEntityMapper } from '../../../src/infrastructure/entity/mapper/fitbit.auth.data.entity.mapper'
import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'

describe('Mappers: FitbitAuthDataEntityMapper', () => {
    const mapper: IEntityMapper<FitbitAuthData, FitbitAuthDataEntity> = new FitbitAuthDataEntityMapper()
    describe('transform()', () => {
        describe('when transform a json into a model', () => {
            it('should return a model', () => {
                const res: FitbitAuthData = mapper.transform(DefaultEntityMock.FITBIT_AUTH_DATA)
                assert.propertyVal(res, 'id', DefaultEntityMock.FITBIT_AUTH_DATA.id)
                assert.propertyVal(res, 'access_token', DefaultEntityMock.FITBIT_AUTH_DATA.access_token)
                assert.property(res, 'expires_in')
                assert.propertyVal(res, 'refresh_token', DefaultEntityMock.FITBIT_AUTH_DATA.refresh_token)
                assert.propertyVal(res, 'scope', DefaultEntityMock.FITBIT_AUTH_DATA.scope)
                assert.propertyVal(res, 'token_type', DefaultEntityMock.FITBIT_AUTH_DATA.token_type)
                assert.propertyVal(res, 'user_id', DefaultEntityMock.FITBIT_AUTH_DATA.user_id)
                assert.propertyVal(res, 'last_sync', DefaultEntityMock.FITBIT_AUTH_DATA.last_sync)
                assert.propertyVal(res, 'status', DefaultEntityMock.FITBIT_AUTH_DATA.status)
            })
            context('when the json is empty', () => {
                it('should return a model with undefined parameters', () => {
                    const res: FitbitAuthData = mapper.transform({})
                    assert.propertyVal(res, 'id', undefined)
                    assert.propertyVal(res, 'access_token', undefined)
                    assert.propertyVal(res, 'expires_in', undefined)
                    assert.propertyVal(res, 'refresh_token', undefined)
                    assert.propertyVal(res, 'scope', undefined)
                    assert.propertyVal(res, 'token_type', undefined)
                    assert.propertyVal(res, 'user_id', undefined)
                    assert.propertyVal(res, 'last_sync', undefined)
                    assert.propertyVal(res, 'status', undefined)
                })
            })
            context('when the json is undefined', () => {
                it('should return a model with undefined parameters', () => {
                    const res: FitbitAuthData = mapper.transform(undefined)
                    assert.propertyVal(res, 'id', undefined)
                    assert.propertyVal(res, 'access_token', undefined)
                    assert.propertyVal(res, 'expires_in', undefined)
                    assert.propertyVal(res, 'refresh_token', undefined)
                    assert.propertyVal(res, 'scope', undefined)
                    assert.propertyVal(res, 'token_type', undefined)
                    assert.propertyVal(res, 'user_id', undefined)
                    assert.propertyVal(res, 'last_sync', undefined)
                    assert.propertyVal(res, 'status', undefined)
                })
            })
        })
        describe('when transform a model into a entity', () => {
            it('should return a entity', () => {
                const res: FitbitAuthDataEntity =
                    mapper.transform(new FitbitAuthData().fromJSON(DefaultEntityMock.FITBIT_AUTH_DATA))
                assert.propertyVal(res, 'access_token', DefaultEntityMock.FITBIT_AUTH_DATA.access_token)
                assert.property(res, 'expires_in')
                assert.propertyVal(res, 'refresh_token', DefaultEntityMock.FITBIT_AUTH_DATA.refresh_token)
                assert.propertyVal(res, 'scope', DefaultEntityMock.FITBIT_AUTH_DATA.scope)
                assert.propertyVal(res, 'token_type', DefaultEntityMock.FITBIT_AUTH_DATA.token_type)
                assert.propertyVal(res, 'user_id', DefaultEntityMock.FITBIT_AUTH_DATA.user_id)
                assert.propertyVal(res, 'last_sync', DefaultEntityMock.FITBIT_AUTH_DATA.last_sync)
                assert.propertyVal(res, 'status', DefaultEntityMock.FITBIT_AUTH_DATA.status)
            })
            context('when the model is empty', () => {
                it('should return a entity with undefined parameters', () => {
                    const res: FitbitAuthDataEntity = mapper.transform(new FitbitAuthData())
                    assert.isEmpty(res)
                })
            })
            context('when the model is undefined', () => {
                it('should return a entity with undefined parameters', () => {
                    const res: FitbitAuthDataEntity = mapper.transform(undefined)
                    assert.propertyVal(res, 'access_token', undefined)
                    assert.propertyVal(res, 'expires_in', undefined)
                    assert.propertyVal(res, 'refresh_token', undefined)
                    assert.propertyVal(res, 'scope', undefined)
                    assert.propertyVal(res, 'token_type', undefined)
                    assert.propertyVal(res, 'user_id', undefined)
                    assert.propertyVal(res, 'last_sync', undefined)
                    assert.propertyVal(res, 'status', undefined)
                })
            })
        })
        describe('when transform a entity into a model', () => {
            it('should throw an error for not implemented method', () => {
                try {
                    mapper.modelEntityToModel(new FitbitAuthData())
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Not implemented!')
                }
            })
        })
    })
})
