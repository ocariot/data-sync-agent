import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { Resource } from '../../../src/application/domain/model/resource'

describe('Models: Resource', () => {
    describe('fromJSON()', () => {
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: Resource = new Resource().fromJSON(DefaultEntityMock.RESOURCE)
                assert.propertyVal(res, 'id', DefaultEntityMock.RESOURCE.id)
                assert.deepPropertyVal(res, 'resource', DefaultEntityMock.RESOURCE.resource)
                assert.propertyVal(res, 'date_sync', DefaultEntityMock.RESOURCE.date_sync)
                assert.propertyVal(res, 'provider', DefaultEntityMock.RESOURCE.provider)
                assert.propertyVal(res, 'user_id', DefaultEntityMock.RESOURCE.user_id)
            })
        })
        context('when convert a json string into a model', () => {
            it('should return a model', () => {
                const res: Resource = new Resource().fromJSON(JSON.stringify(DefaultEntityMock.RESOURCE))
                assert.propertyVal(res, 'id', DefaultEntityMock.RESOURCE.id)
                assert.deepPropertyVal(res, 'resource', DefaultEntityMock.RESOURCE.resource)
                assert.propertyVal(res, 'date_sync', DefaultEntityMock.RESOURCE.date_sync)
                assert.propertyVal(res, 'provider', DefaultEntityMock.RESOURCE.provider)
                assert.propertyVal(res, 'user_id', DefaultEntityMock.RESOURCE.user_id)
            })
        })
        context('when json is invalid', () => {
            it('should return undefined parameters for undefined json', () => {
                const res: Resource = new Resource().fromJSON(undefined)
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'resource', undefined)
                assert.propertyVal(res, 'date_sync', undefined)
                assert.propertyVal(res, 'provider', undefined)
                assert.propertyVal(res, 'user_id', undefined)
            })
            it('should return undefined parameters for empty json', () => {
                const res: Resource = new Resource().fromJSON({})
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'resource', undefined)
                assert.propertyVal(res, 'date_sync', undefined)
                assert.propertyVal(res, 'provider', undefined)
                assert.propertyVal(res, 'user_id', undefined)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: Resource = new Resource().fromJSON('')
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'resource', undefined)
                assert.propertyVal(res, 'date_sync', undefined)
                assert.propertyVal(res, 'provider', undefined)
                assert.propertyVal(res, 'user_id', undefined)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: Resource = new Resource().fromJSON('invalid')
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'resource', undefined)
                assert.propertyVal(res, 'date_sync', undefined)
                assert.propertyVal(res, 'provider', undefined)
                assert.propertyVal(res, 'user_id', undefined)
            })
        })
    })

    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: Resource = new Resource().fromJSON(DefaultEntityMock.RESOURCE)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.RESOURCE)
            })
        })
        context('when the model parameters are undefined', () => {
            it('should return a json with undefined parameters', () => {
                const model: Resource = new Resource().fromJSON({})
                const res: any = model.toJSON()
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'resource', undefined)
                assert.propertyVal(res, 'date_sync', undefined)
                assert.propertyVal(res, 'provider', undefined)
                assert.propertyVal(res, 'user_id', undefined)
            })
        })
    })
})
