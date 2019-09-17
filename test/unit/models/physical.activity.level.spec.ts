import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { PhysicalActivityLevel } from '../../../src/application/domain/model/physical.activity.level'

describe('Models: PhysicalActivityLevel', () => {
    describe('fromJSON()', () => {
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: PhysicalActivityLevel =
                    new PhysicalActivityLevel().fromJSON(DefaultEntityMock.PHYSICAL_ACTIVITY_LEVEL)
                assert.propertyVal(res, 'name', DefaultEntityMock.PHYSICAL_ACTIVITY_LEVEL.name)
                assert.deepPropertyVal(res, 'duration', DefaultEntityMock.PHYSICAL_ACTIVITY_LEVEL.duration)
            })
        })
        context('when convert a json string into a model', () => {
            it('should return a model', () => {
                const res: PhysicalActivityLevel = new PhysicalActivityLevel()
                    .fromJSON(JSON.stringify(DefaultEntityMock.PHYSICAL_ACTIVITY_LEVEL))
                assert.propertyVal(res, 'name', DefaultEntityMock.PHYSICAL_ACTIVITY_LEVEL.name)
                assert.deepPropertyVal(res, 'duration', DefaultEntityMock.PHYSICAL_ACTIVITY_LEVEL.duration)
            })
        })
        context('when json is invalid', () => {
            it('should return undefined parameters for undefined json', () => {
                const res: PhysicalActivityLevel = new PhysicalActivityLevel().fromJSON(undefined)
                assert.propertyVal(res, 'name', undefined)
                assert.propertyVal(res, 'duration', undefined)
            })
            it('should return undefined parameters for empty json', () => {
                const res: PhysicalActivityLevel = new PhysicalActivityLevel().fromJSON({})
                assert.propertyVal(res, 'name', undefined)
                assert.propertyVal(res, 'duration', undefined)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: PhysicalActivityLevel = new PhysicalActivityLevel().fromJSON('')
                assert.propertyVal(res, 'name', undefined)
                assert.propertyVal(res, 'duration', undefined)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: PhysicalActivityLevel = new PhysicalActivityLevel().fromJSON('invalid')
                assert.propertyVal(res, 'name', undefined)
                assert.propertyVal(res, 'duration', undefined)
            })
        })
    })

    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: PhysicalActivityLevel =
                    new PhysicalActivityLevel().fromJSON(DefaultEntityMock.PHYSICAL_ACTIVITY_LEVEL)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.PHYSICAL_ACTIVITY_LEVEL)
            })
        })
        context('when the model parameters are undefined', () => {
            it('should return a json with undefined parameters', () => {
                const model: PhysicalActivityLevel = new PhysicalActivityLevel().fromJSON({})
                const res: any = model.toJSON()
                assert.propertyVal(res, 'name', undefined)
                assert.propertyVal(res, 'duration', undefined)
            })
        })
    })
})
