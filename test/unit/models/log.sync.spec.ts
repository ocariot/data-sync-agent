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
                assertDataSync(res)
            })
            it('should return undefined parameters for empty json', () => {
                const res: LogSync = new LogSync().fromJSON({})
                assertDataSync(res)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: LogSync = new LogSync().fromJSON('')
                assertDataSync(res)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: LogSync = new LogSync().fromJSON('invalid')
                assertDataSync(res)
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
                assertDataSync(res)
            })
        })
    })

    function assertDataSync(res: LogSync) {
        assert.equal(res.steps, 0)
        assert.equal(res.calories, 0)
        assert.equal(res.active_minutes, 0)
        assert.equal(res.lightly_active_minutes, 0)
        assert.equal(res.sedentary_minutes, 0)
    }
})
