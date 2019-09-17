import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { Log } from '../../../src/application/domain/model/log'

describe('Models: Log', () => {
    describe('fromJSON()', () => {
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: Log = new Log().fromJSON(DefaultEntityMock.LOG)
                assert.propertyVal(res, 'date', DefaultEntityMock.LOG.date)
                assert.propertyVal(res, 'value', DefaultEntityMock.LOG.value)
                assert.propertyVal(res, 'type', DefaultEntityMock.LOG.type)
                assert.propertyVal(res, 'child_id', DefaultEntityMock.LOG.child_id)
            })
        })
        context('when convert a json string into a model', () => {
            it('should return a model', () => {
                const res: Log = new Log().fromJSON(JSON.stringify(DefaultEntityMock.LOG))
                assert.propertyVal(res, 'date', DefaultEntityMock.LOG.date)
                assert.propertyVal(res, 'value', DefaultEntityMock.LOG.value)
                assert.propertyVal(res, 'type', DefaultEntityMock.LOG.type)
                assert.propertyVal(res, 'child_id', DefaultEntityMock.LOG.child_id)
            })
        })
        context('when json is invalid', () => {
            it('should return undefined parameters for undefined json', () => {
                const res: Log = new Log().fromJSON(undefined)
                assert.propertyVal(res, 'date', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', undefined)
                assert.propertyVal(res, 'child_id', undefined)
            })
            it('should return undefined parameters for empty json', () => {
                const res: Log = new Log().fromJSON({})
                assert.propertyVal(res, 'date', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', undefined)
                assert.propertyVal(res, 'child_id', undefined)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: Log = new Log().fromJSON('')
                assert.propertyVal(res, 'date', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', undefined)
                assert.propertyVal(res, 'child_id', undefined)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: Log = new Log().fromJSON('invalid')
                assert.propertyVal(res, 'date', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', undefined)
                assert.propertyVal(res, 'child_id', undefined)
            })
        })
    })

    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: Log = new Log().fromJSON(DefaultEntityMock.LOG)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.LOG)
            })
        })
        context('when the model parameters are undefined', () => {
            it('should return a json with undefined parameters', () => {
                const model: Log = new Log().fromJSON({})
                const res: any = model.toJSON()
                assert.propertyVal(res, 'date', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', undefined)
                assert.propertyVal(res, 'child_id', undefined)
            })
        })
    })
})
