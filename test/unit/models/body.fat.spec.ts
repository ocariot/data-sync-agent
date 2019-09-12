import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { BodyFat } from '../../../src/application/domain/model/body.fat'
import { MeasurementType } from '../../../src/application/domain/model/measurement'

describe('Models: BodyFat', () => {
    describe('fromJSON()', () => {
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: BodyFat = new BodyFat().fromJSON(DefaultEntityMock.BODY_FAT)
                assert.propertyVal(res, 'id', DefaultEntityMock.BODY_FAT.id)
                assert.propertyVal(res, 'unit', DefaultEntityMock.BODY_FAT.unit)
                assert.propertyVal(res, 'timestamp', DefaultEntityMock.BODY_FAT.timestamp)
                assert.propertyVal(res, 'value', DefaultEntityMock.BODY_FAT.value)
                assert.propertyVal(res, 'type', DefaultEntityMock.BODY_FAT.type)
                assert.propertyVal(res, 'child_id', DefaultEntityMock.BODY_FAT.child_id)
            })
        })
        context('when convert a json string into a model', () => {
            it('should return a model', () => {
                const res: BodyFat = new BodyFat().fromJSON(JSON.stringify(DefaultEntityMock.BODY_FAT))
                assert.propertyVal(res, 'id', DefaultEntityMock.BODY_FAT.id)
                assert.propertyVal(res, 'unit', DefaultEntityMock.BODY_FAT.unit)
                assert.propertyVal(res, 'timestamp', DefaultEntityMock.BODY_FAT.timestamp)
                assert.propertyVal(res, 'value', DefaultEntityMock.BODY_FAT.value)
                assert.propertyVal(res, 'type', DefaultEntityMock.BODY_FAT.type)
                assert.propertyVal(res, 'child_id', DefaultEntityMock.BODY_FAT.child_id)
            })
        })
        context('when json is invalid', () => {
            it('should return undefined parameters for undefined json', () => {
                const res: BodyFat = new BodyFat().fromJSON(undefined)
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'unit', '%')
                assert.propertyVal(res, 'timestamp', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', MeasurementType.BODY_FAT)
                assert.propertyVal(res, 'child_id', undefined)
            })
            it('should return undefined parameters for empty json', () => {
                const res: BodyFat = new BodyFat().fromJSON({})
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'unit', '%')
                assert.propertyVal(res, 'timestamp', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', MeasurementType.BODY_FAT)
                assert.propertyVal(res, 'child_id', undefined)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: BodyFat = new BodyFat().fromJSON('')
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'unit', '%')
                assert.propertyVal(res, 'timestamp', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', MeasurementType.BODY_FAT)
                assert.propertyVal(res, 'child_id', undefined)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: BodyFat = new BodyFat().fromJSON('invalid')
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'unit', '%')
                assert.propertyVal(res, 'timestamp', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', MeasurementType.BODY_FAT)
                assert.propertyVal(res, 'child_id', undefined)
            })
        })
    })

    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: BodyFat = new BodyFat().fromJSON(DefaultEntityMock.BODY_FAT)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.BODY_FAT)
            })
        })
        context('when the model parameters are undefined', () => {
            it('should return a json with undefined parameters', () => {
                const model: BodyFat = new BodyFat().fromJSON({})
                const res: any = model.toJSON()
                assert.propertyVal(res, 'id', undefined)
                assert.propertyVal(res, 'unit', '%')
                assert.propertyVal(res, 'timestamp', undefined)
                assert.propertyVal(res, 'value', undefined)
                assert.propertyVal(res, 'type', MeasurementType.BODY_FAT)
                assert.propertyVal(res, 'child_id', undefined)
            })
        })
    })
})
