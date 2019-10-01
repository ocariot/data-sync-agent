import { IEntityMapper } from '../../../src/infrastructure/port/entity.mapper.interface'
import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { FitbitAuthData } from '../../../src/application/domain/model/fitbit.auth.data'
import { UserAuthData } from '../../../src/application/domain/model/user.auth.data'
import { UserAuthDataEntity } from '../../../src/infrastructure/entity/user.auth.data.entity'
import { UserAuthDataEntityMapper } from '../../../src/infrastructure/entity/mapper/user.auth.data.entity.mapper'

describe('Mappers: UserAuthDataEntityMapper', () => {
    const mapper: IEntityMapper<UserAuthData, UserAuthDataEntity> = new UserAuthDataEntityMapper()
    describe('transform()', () => {
        describe('when transform a json into a model', () => {
            it('should return a model', () => {
                const res: UserAuthData = mapper.transform(DefaultEntityMock.USER_AUTH_DATA)
                assert.propertyVal(res, 'id', DefaultEntityMock.USER_AUTH_DATA.id)
                assert.propertyVal(res, 'user_id', DefaultEntityMock.USER_AUTH_DATA.user_id)
                assert.deepPropertyVal(res, 'fitbit',
                    new FitbitAuthData().fromJSON(DefaultEntityMock.USER_AUTH_DATA.fitbit))
            })
            context('when the json is empty', () => {
                it('should return a model with undefined parameters', () => {
                    const res: UserAuthData = mapper.transform({})
                    assert.propertyVal(res, 'id', undefined)
                    assert.propertyVal(res, 'user_id', undefined)
                    assert.propertyVal(res, 'fitbit', undefined)
                })
            })
            context('when the json is undefined', () => {
                it('should return a model with undefined parameters', () => {
                    const res: UserAuthData = mapper.transform(undefined)
                    assert.propertyVal(res, 'id', undefined)
                    assert.propertyVal(res, 'user_id', undefined)
                    assert.propertyVal(res, 'fitbit', undefined)
                })
            })
        })
        describe('when transform a model into a entity', () => {
            it('should return a entity', () => {
                const res: UserAuthDataEntity =
                    mapper.transform(new UserAuthData().fromJSON(DefaultEntityMock.USER_AUTH_DATA))
                assert.deepEqual(res, DefaultEntityMock.USER_AUTH_DATA_BEFORE)
            })
            context('when the model is empty', () => {
                it('should return a entity with undefined parameters', () => {
                    const res: UserAuthDataEntity = mapper.transform(new UserAuthData())
                    assert.isEmpty(res)
                })
            })
            context('when the model is undefined', () => {
                it('should return a entity with undefined parameters', () => {
                    const res: UserAuthDataEntity = mapper.transform(undefined)
                    assert.propertyVal(res, 'user_id', undefined)
                    assert.propertyVal(res, 'fitbit', undefined)
                })
            })
        })
        describe('when transform a entity into a model', () => {
            it('should throw an error for not implemented method', () => {
                try {
                    mapper.modelEntityToModel(new UserAuthData())
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Not implemented!')
                }
            })
        })
    })
})
