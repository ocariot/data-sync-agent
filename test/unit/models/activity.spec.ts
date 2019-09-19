import { Activity } from '../../../src/application/domain/model/activity'
import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'

describe('Models: Activity', () => {
    describe('fromJSON()', () => {
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: Activity = new Activity().fromJSON(DefaultEntityMock.ACTIVITY)
                assert.propertyVal(res, 'id', DefaultEntityMock.ACTIVITY.id)
                assert.deepPropertyVal(res, 'start_time', DefaultEntityMock.ACTIVITY.start_time)
                assert.deepPropertyVal(res, 'end_time', DefaultEntityMock.ACTIVITY.end_time)
                assert.propertyVal(res, 'duration', DefaultEntityMock.ACTIVITY.duration)
                assert.propertyVal(res, 'child_id', DefaultEntityMock.ACTIVITY.child_id)
            })
        })
        context('when convert a json string into a model', () => {
            it('should return a model', () => {
                const res: Activity = new Activity().fromJSON(JSON.stringify(DefaultEntityMock.ACTIVITY))
                assert.propertyVal(res, 'id', DefaultEntityMock.ACTIVITY.id)
                assert.deepPropertyVal(res, 'start_time', DefaultEntityMock.ACTIVITY.start_time)
                assert.deepPropertyVal(res, 'end_time', DefaultEntityMock.ACTIVITY.end_time)
                assert.propertyVal(res, 'duration', DefaultEntityMock.ACTIVITY.duration)
                assert.propertyVal(res, 'child_id', DefaultEntityMock.ACTIVITY.child_id)
            })
        })
        context('when json is invalid', () => {
            it('should return undefined parameters for undefined json', () => {
                const res: Activity = new Activity().fromJSON(undefined)
                assert.propertyVal(res, 'id', undefined)
                assert.deepPropertyVal(res, 'start_time', undefined)
                assert.deepPropertyVal(res, 'end_time', undefined)
                assert.propertyVal(res, 'duration', undefined)
                assert.propertyVal(res, 'child_id', undefined)
            })
            it('should return undefined parameters for empty json', () => {
                const res: Activity = new Activity().fromJSON({})
                assert.propertyVal(res, 'id', undefined)
                assert.deepPropertyVal(res, 'start_time', undefined)
                assert.deepPropertyVal(res, 'end_time', undefined)
                assert.propertyVal(res, 'duration', undefined)
                assert.propertyVal(res, 'child_id', undefined)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: Activity = new Activity().fromJSON('')
                assert.propertyVal(res, 'id', undefined)
                assert.deepPropertyVal(res, 'start_time', undefined)
                assert.deepPropertyVal(res, 'end_time', undefined)
                assert.propertyVal(res, 'duration', undefined)
                assert.propertyVal(res, 'child_id', undefined)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: Activity = new Activity().fromJSON('invalid')
                assert.propertyVal(res, 'id', undefined)
                assert.deepPropertyVal(res, 'start_time', undefined)
                assert.deepPropertyVal(res, 'end_time', undefined)
                assert.propertyVal(res, 'duration', undefined)
                assert.propertyVal(res, 'child_id', undefined)
            })
        })
    })

    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: Activity = new Activity().fromJSON(DefaultEntityMock.ACTIVITY)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.ACTIVITY)
            })
        })
        context('when the model parameters are undefined', () => {
            it('should return a json with undefined parameters', () => {
                const model: Activity = new Activity().fromJSON({})
                const res: any = model.toJSON()
                assert.propertyVal(res, 'id', undefined)
                assert.deepPropertyVal(res, 'start_time', undefined)
                assert.deepPropertyVal(res, 'end_time', undefined)
                assert.propertyVal(res, 'duration', undefined)
                assert.propertyVal(res, 'child_id', undefined)
            })
        })
    })
})
