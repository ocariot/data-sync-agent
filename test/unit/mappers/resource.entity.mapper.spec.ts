import { IEntityMapper } from '../../../src/infrastructure/port/entity.mapper.interface'
import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { Resource } from '../../../src/application/domain/model/resource'
import { ResourceEntity } from '../../../src/infrastructure/entity/resource.entity'
import { ResourceEntityMapper } from '../../../src/infrastructure/entity/mapper/resource.entity.mapper'

describe('Mappers: ResourceEntityMapper', () => {
    const mapper: IEntityMapper<Resource, ResourceEntity> = new ResourceEntityMapper()
    describe('transform()', () => {
        describe('when transform a json into a model', () => {
            it('should return a model', () => {
                const res: Resource = mapper.transform(DefaultEntityMock.RESOURCE)
                assert.propertyVal(res, 'id', DefaultEntityMock.RESOURCE.id)
                assert.propertyVal(res, 'date_sync', DefaultEntityMock.RESOURCE.date_sync)
                assert.propertyVal(res, 'provider', DefaultEntityMock.RESOURCE.provider)
                assert.propertyVal(res, 'user_id', DefaultEntityMock.RESOURCE.user_id)
            })
            context('when the json is empty', () => {
                it('should return a model with undefined parameters', () => {
                    const res: Resource = mapper.transform({})
                    assert.propertyVal(res, 'id', undefined)
                    assert.propertyVal(res, 'resource', undefined)
                    assert.propertyVal(res, 'date_sync', undefined)
                    assert.propertyVal(res, 'provider', undefined)
                    assert.propertyVal(res, 'user_id', undefined)
                })
            })
            context('when the json is undefined', () => {
                it('should return a model with undefined parameters', () => {
                    const res: Resource = mapper.transform(undefined)
                    assert.propertyVal(res, 'id', undefined)
                    assert.propertyVal(res, 'resource', undefined)
                    assert.propertyVal(res, 'date_sync', undefined)
                    assert.propertyVal(res, 'provider', undefined)
                    assert.propertyVal(res, 'user_id', undefined)
                })
            })
        })
        describe('when transform a model into a entity', () => {
            it('should return a entity', () => {
                const res: ResourceEntity =
                    mapper.transform(new Resource().fromJSON(DefaultEntityMock.RESOURCE))
                assert.propertyVal(res, 'resource', DefaultEntityMock.RESOURCE.resource)
                assert.propertyVal(res, 'date_sync', DefaultEntityMock.RESOURCE.date_sync)
                assert.propertyVal(res, 'provider', DefaultEntityMock.RESOURCE.provider)
                assert.propertyVal(res, 'user_id', DefaultEntityMock.RESOURCE.user_id)
            })
            context('when the model is empty', () => {
                it('should return a entity with undefined parameters', () => {
                    const res: ResourceEntity = mapper.transform(new Resource())
                    assert.isEmpty(res)
                })
            })
            context('when the model is undefined', () => {
                it('should return a entity with undefined parameters', () => {
                    const res: ResourceEntity = mapper.transform(undefined)
                    assert.propertyVal(res, 'resource', undefined)
                    assert.propertyVal(res, 'date_sync', undefined)
                    assert.propertyVal(res, 'provider', undefined)
                    assert.propertyVal(res, 'user_id', undefined)
                })
            })
        })
        describe('when transform a entity into a model', () => {
            it('should throw an error for not implemented method', () => {
                try {
                    mapper.modelEntityToModel(new Resource())
                } catch (err) {
                    assert.propertyVal(err, 'message', 'Not implemented!')
                }
            })
        })
    })
})
