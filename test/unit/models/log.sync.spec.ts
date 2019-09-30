import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { LogSync } from '../../../src/application/domain/model/log.sync'

describe('Models: LogSync', () => {
    describe('fromJSON()', () => {
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: LogSync = new LogSync().fromJSON(DefaultEntityMock.LOG_SYNC)
                assert.propertyVal(res, 'calories', 1)
                assert.propertyVal(res, 'steps', 1)
                assert.propertyVal(res, 'active_minutes', 1)
                assert.propertyVal(res, 'lightly_active_minutes', 1)
                assert.propertyVal(res, 'sedentary_minutes', 1)
            })
        })
        context('when convert a json string into a model', () => {
            it('should return a model', () => {
                const res: LogSync = new LogSync().fromJSON(JSON.stringify(DefaultEntityMock.LOG_SYNC))
                assert.propertyVal(res, 'calories', 1)
                assert.propertyVal(res, 'steps', 1)
                assert.propertyVal(res, 'active_minutes', 1)
                assert.propertyVal(res, 'lightly_active_minutes', 1)
                assert.propertyVal(res, 'sedentary_minutes', 1)
            })
        })
        context('when json is invalid', () => {
            it('should return undefined parameters for undefined json', () => {
                const res: LogSync = new LogSync().fromJSON(undefined)
                assert.isUndefined(res.calories)
                assert.isUndefined(res.steps)
                assert.isUndefined(res.active_minutes)
                assert.isUndefined(res.lightly_active_minutes)
                assert.isUndefined(res.sedentary_minutes)
            })
            it('should return undefined parameters for empty json', () => {
                const res: LogSync = new LogSync().fromJSON({})
                assert.isUndefined(res.calories)
                assert.isUndefined(res.steps)
                assert.isUndefined(res.active_minutes)
                assert.isUndefined(res.lightly_active_minutes)
                assert.isUndefined(res.sedentary_minutes)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: LogSync = new LogSync().fromJSON('')
                assert.isUndefined(res.calories)
                assert.isUndefined(res.steps)
                assert.isUndefined(res.active_minutes)
                assert.isUndefined(res.lightly_active_minutes)
                assert.isUndefined(res.sedentary_minutes)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: LogSync = new LogSync().fromJSON('invalid')
                assert.isUndefined(res.calories)
                assert.isUndefined(res.steps)
                assert.isUndefined(res.active_minutes)
                assert.isUndefined(res.lightly_active_minutes)
                assert.isUndefined(res.sedentary_minutes)
            })
        })
    })

    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: LogSync = new LogSync().fromJSON(DefaultEntityMock.LOG_SYNC)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.LOG_SYNC)
            })
        })
        context('when the model parameters are undefined', () => {
            it('should return a json with undefined parameters', () => {
                const model: LogSync = new LogSync().fromJSON({})
                const res: any = model.toJSON()
                assert.isUndefined(res.calories)
                assert.isUndefined(res.steps)
                assert.isUndefined(res.active_minutes)
                assert.isUndefined(res.lightly_active_minutes)
                assert.isUndefined(res.sedentary_minutes)
            })
        })
    })
})
