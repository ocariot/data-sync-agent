import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { MeasurementType } from '../../../src/application/domain/model/measurement'
import { Weight } from '../../../src/application/domain/model/weight'

describe('Models: Weight', () => {
    describe('fromJSON()', () => {
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: Weight = new Weight().fromJSON(DefaultEntityMock.WEIGHT)
                assert.propertyVal(res, 'id', DefaultEntityMock.WEIGHT.id)
                assert.propertyVal(res, 'unit', DefaultEntityMock.WEIGHT.unit)
                assert.propertyVal(res, 'timestamp', DefaultEntityMock.WEIGHT.timestamp)
                assert.propertyVal(res, 'value', DefaultEntityMock.WEIGHT.value)
                assert.propertyVal(res, 'type', DefaultEntityMock.WEIGHT.type)
                assert.propertyVal(res, 'child_id', DefaultEntityMock.WEIGHT.child_id)
            })
        })
        context('when convert a json string into a model', () => {
            it('should return a model', () => {
                const res: Weight = new Weight().fromJSON(JSON.stringify(DefaultEntityMock.WEIGHT))
                assert.propertyVal(res, 'id', DefaultEntityMock.WEIGHT.id)
                assert.propertyVal(res, 'unit', DefaultEntityMock.WEIGHT.unit)
                assert.propertyVal(res, 'timestamp', DefaultEntityMock.WEIGHT.timestamp)
                assert.propertyVal(res, 'value', DefaultEntityMock.WEIGHT.value)
                assert.propertyVal(res, 'type', DefaultEntityMock.WEIGHT.type)
                assert.propertyVal(res, 'child_id', DefaultEntityMock.WEIGHT.child_id)
            })
        })
        context('when json is invalid', () => {
            it('should return undefined parameters for undefined json', () => {
                const res: Weight = new Weight().fromJSON(undefined)
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'unit', 'kg')
                assert.propertyVal(res, 'timestamp', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', MeasurementType.WEIGHT)
                assert.propertyVal(res, 'child_id', undefined)
            })
            it('should return undefined parameters for empty json', () => {
                const res: Weight = new Weight().fromJSON({})
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'unit', 'kg')
                assert.propertyVal(res, 'timestamp', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', MeasurementType.WEIGHT)
                assert.propertyVal(res, 'child_id', undefined)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: Weight = new Weight().fromJSON('')
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'unit', 'kg')
                assert.propertyVal(res, 'timestamp', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', MeasurementType.WEIGHT)
                assert.propertyVal(res, 'child_id', undefined)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: Weight = new Weight().fromJSON('invalid')
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'unit', 'kg')
                assert.propertyVal(res, 'timestamp', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', MeasurementType.WEIGHT)
                assert.propertyVal(res, 'child_id', undefined)
            })
        })
    })

    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: Weight = new Weight().fromJSON(DefaultEntityMock.WEIGHT)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.WEIGHT)
            })
        })
        context('when the model parameters are undefined', () => {
            it('should return a json with undefined parameters', () => {
                const model: Weight = new Weight().fromJSON({})
                const res: any = model.toJSON()
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'unit', 'kg')
                assert.propertyVal(res, 'timestamp', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', MeasurementType.WEIGHT)
                assert.propertyVal(res, 'child_id', undefined)
            })
        })
    })
})
