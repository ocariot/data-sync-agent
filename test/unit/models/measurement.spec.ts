import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { Measurement } from '../../../src/application/domain/model/measurement'

describe('Models: Measurement', () => {
    describe('fromJSON()', () => {
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: Measurement = new Measurement().fromJSON(DefaultEntityMock.MEASUREMENT)
                assert.propertyVal(res, 'id', DefaultEntityMock.MEASUREMENT.id)
                assert.propertyVal(res, 'unit', DefaultEntityMock.MEASUREMENT.unit)
                assert.propertyVal(res, 'timestamp', DefaultEntityMock.MEASUREMENT.timestamp)
                assert.propertyVal(res, 'value', DefaultEntityMock.MEASUREMENT.value)
                assert.propertyVal(res, 'type', DefaultEntityMock.MEASUREMENT.type)
                assert.propertyVal(res, 'child_id', DefaultEntityMock.MEASUREMENT.child_id)
            })
        })
        context('when convert a json string into a model', () => {
            it('should return a model', () => {
                const res: Measurement = new Measurement().fromJSON(JSON.stringify(DefaultEntityMock.MEASUREMENT))
                assert.propertyVal(res, 'id', DefaultEntityMock.MEASUREMENT.id)
                assert.propertyVal(res, 'unit', DefaultEntityMock.MEASUREMENT.unit)
                assert.propertyVal(res, 'timestamp', DefaultEntityMock.MEASUREMENT.timestamp)
                assert.propertyVal(res, 'value', DefaultEntityMock.MEASUREMENT.value)
                assert.propertyVal(res, 'type', DefaultEntityMock.MEASUREMENT.type)
                assert.propertyVal(res, 'child_id', DefaultEntityMock.MEASUREMENT.child_id)
            })
        })
        context('when json is invalid', () => {
            it('should return undefined parameters for undefined json', () => {
                const res: Measurement = new Measurement().fromJSON(undefined)
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'unit', undefined)
                assert.propertyVal(res, 'timestamp', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', undefined)
                assert.propertyVal(res, 'child_id', undefined)
            })
            it('should return undefined parameters for empty json', () => {
                const res: Measurement = new Measurement().fromJSON({})
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'unit', undefined)
                assert.propertyVal(res, 'timestamp', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', undefined)
                assert.propertyVal(res, 'child_id', undefined)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: Measurement = new Measurement().fromJSON('')
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'unit', undefined)
                assert.propertyVal(res, 'timestamp', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', undefined)
                assert.propertyVal(res, 'child_id', undefined)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: Measurement = new Measurement().fromJSON('invalid')
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'unit', undefined)
                assert.propertyVal(res, 'timestamp', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', undefined)
                assert.propertyVal(res, 'child_id', undefined)
            })
        })
    })

    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: Measurement = new Measurement().fromJSON(DefaultEntityMock.MEASUREMENT)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.MEASUREMENT)
            })
        })
        context('when the model parameters are undefined', () => {
            it('should return a json with undefined parameters', () => {
                const model: Measurement = new Measurement().fromJSON({})
                const res: any = model.toJSON()
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'unit', undefined)
                assert.propertyVal(res, 'timestamp', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', undefined)
                assert.propertyVal(res, 'child_id', undefined)
            })
        })
    })
})
