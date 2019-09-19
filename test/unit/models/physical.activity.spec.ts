import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { PhysicalActivityLevel } from '../../../src/application/domain/model/physical.activity.level'
import { PhysicalActivityHeartRate } from '../../../src/application/domain/model/physical.activity.heart.rate'

describe('Models: PhysicalActivity', () => {
    describe('fromJSON()', () => {
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: PhysicalActivity = new PhysicalActivity().fromJSON(DefaultEntityMock.PHYSICAL_ACTIVITY)
                assert.propertyVal(res, 'id', DefaultEntityMock.PHYSICAL_ACTIVITY.id)
                assert.deepPropertyVal(res, 'start_time', DefaultEntityMock.ACTIVITY.start_time)
                assert.deepPropertyVal(res, 'end_time', DefaultEntityMock.ACTIVITY.end_time)
                assert.propertyVal(res, 'child_id', DefaultEntityMock.PHYSICAL_ACTIVITY.child_id)
                assert.propertyVal(res, 'name', DefaultEntityMock.PHYSICAL_ACTIVITY.name)
                assert.deepPropertyVal(res, 'calories', DefaultEntityMock.PHYSICAL_ACTIVITY.calories)
                assert.deepPropertyVal(res, 'steps', DefaultEntityMock.PHYSICAL_ACTIVITY.steps)
                assert.deepPropertyVal(res, 'levels',
                    [new PhysicalActivityLevel().fromJSON(DefaultEntityMock.PHYSICAL_ACTIVITY.levels[0])])
                assert.deepPropertyVal(res, 'heart_rate',
                    new PhysicalActivityHeartRate().fromJSON(DefaultEntityMock.PHYSICAL_ACTIVITY.heart_rate))
            })
        })
        context('when convert a json string into a model', () => {
            it('should return a model', () => {
                const res: PhysicalActivity =
                    new PhysicalActivity().fromJSON(JSON.stringify(DefaultEntityMock.PHYSICAL_ACTIVITY))
                assert.propertyVal(res, 'id', DefaultEntityMock.PHYSICAL_ACTIVITY.id)
                assert.deepPropertyVal(res, 'start_time', DefaultEntityMock.ACTIVITY.start_time)
                assert.deepPropertyVal(res, 'end_time', DefaultEntityMock.ACTIVITY.end_time)
                assert.propertyVal(res, 'child_id', DefaultEntityMock.PHYSICAL_ACTIVITY.child_id)
                assert.propertyVal(res, 'name', DefaultEntityMock.PHYSICAL_ACTIVITY.name)
                assert.deepPropertyVal(res, 'calories', DefaultEntityMock.PHYSICAL_ACTIVITY.calories)
                assert.deepPropertyVal(res, 'steps', DefaultEntityMock.PHYSICAL_ACTIVITY.steps)
                assert.deepPropertyVal(res, 'levels',
                    [new PhysicalActivityLevel().fromJSON(DefaultEntityMock.PHYSICAL_ACTIVITY.levels[0])])
                assert.deepPropertyVal(res, 'heart_rate',
                    new PhysicalActivityHeartRate().fromJSON(DefaultEntityMock.PHYSICAL_ACTIVITY.heart_rate))
            })
        })
        context('when json is invalid', () => {
            it('should return undefined parameters for undefined json', () => {
                const res: PhysicalActivity = new PhysicalActivity().fromJSON(undefined)
                assert.propertyVal(res, 'id', undefined)
                assert.deepPropertyVal(res, 'start_time', undefined)
                assert.deepPropertyVal(res, 'end_time', undefined)
                assert.propertyVal(res, 'child_id', undefined)
                assert.propertyVal(res, 'name', undefined)
                assert.propertyVal(res, 'calories', undefined)
                assert.propertyVal(res, 'levels', undefined)
                assert.propertyVal(res, 'heart_rate', undefined)
            })
            it('should return undefined parameters for empty json', () => {
                const res: PhysicalActivity = new PhysicalActivity().fromJSON({})
                assert.propertyVal(res, 'id', undefined)
                assert.deepPropertyVal(res, 'start_time', undefined)
                assert.deepPropertyVal(res, 'end_time', undefined)
                assert.propertyVal(res, 'child_id', undefined)
                assert.propertyVal(res, 'name', undefined)
                assert.propertyVal(res, 'calories', undefined)
                assert.propertyVal(res, 'levels', undefined)
                assert.propertyVal(res, 'heart_rate', undefined)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: PhysicalActivity = new PhysicalActivity().fromJSON('')
                assert.propertyVal(res, 'id', undefined)
                assert.deepPropertyVal(res, 'start_time', undefined)
                assert.deepPropertyVal(res, 'end_time', undefined)
                assert.propertyVal(res, 'child_id', undefined)
                assert.propertyVal(res, 'name', undefined)
                assert.propertyVal(res, 'calories', undefined)
                assert.propertyVal(res, 'levels', undefined)
                assert.propertyVal(res, 'heart_rate', undefined)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: PhysicalActivity = new PhysicalActivity().fromJSON('invalid')
                assert.propertyVal(res, 'id', undefined)
                assert.deepPropertyVal(res, 'start_time', undefined)
                assert.deepPropertyVal(res, 'end_time', undefined)
                assert.propertyVal(res, 'child_id', undefined)
                assert.propertyVal(res, 'name', undefined)
                assert.propertyVal(res, 'calories', undefined)
                assert.propertyVal(res, 'levels', undefined)
                assert.propertyVal(res, 'heart_rate', undefined)
            })
        })
    })

    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: PhysicalActivity = new PhysicalActivity().fromJSON(DefaultEntityMock.PHYSICAL_ACTIVITY)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.PHYSICAL_ACTIVITY)
            })
        })
        context('when the model parameters are undefined', () => {
            it('should return a json with undefined parameters', () => {
                const model: PhysicalActivity = new PhysicalActivity().fromJSON({})
                const res: any = model.toJSON()
                assert.propertyVal(res, 'id', undefined)
                assert.deepPropertyVal(res, 'start_time', undefined)
                assert.deepPropertyVal(res, 'end_time', undefined)
                assert.propertyVal(res, 'child_id', undefined)
                assert.propertyVal(res, 'name', undefined)
                assert.propertyVal(res, 'calories', undefined)
                assert.propertyVal(res, 'levels', undefined)
                assert.propertyVal(res, 'heart_rate', undefined)
            })
        })
    })
})
