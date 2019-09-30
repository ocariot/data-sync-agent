import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { LogSync } from '../../../src/application/domain/model/log.sync'
import { DataSync } from '../../../src/application/domain/model/data.sync'

describe('Models: DataSync', () => {
    describe('fromJSON()', () => {
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: DataSync = new DataSync().fromJSON(DefaultEntityMock.DATA_SYNC)
                assert.propertyVal(res, 'activities', 1)
                assert.propertyVal(res, 'sleep', 1)
                assert.propertyVal(res, 'weights', 1)
                assert.deepPropertyVal(res, 'logs', new LogSync().fromJSON(DefaultEntityMock.LOG_SYNC))
            })
        })
        context('when convert a json string into a model', () => {
            it('should return a model', () => {
                const res: DataSync = new DataSync().fromJSON(JSON.stringify(DefaultEntityMock.DATA_SYNC))
                assert.propertyVal(res, 'activities', 1)
                assert.propertyVal(res, 'sleep', 1)
                assert.propertyVal(res, 'weights', 1)
                assert.deepPropertyVal(res, 'logs', new LogSync().fromJSON(DefaultEntityMock.LOG_SYNC))
            })
        })
        context('when json is invalid', () => {
            it('should return undefined parameters for undefined json', () => {
                const res: DataSync = new DataSync().fromJSON(undefined)
                assert.isUndefined(res.activities)
                assert.isUndefined(res.sleep)
                assert.isUndefined(res.weights)
                assert.isUndefined(res.logs)
            })
            it('should return undefined parameters for empty json', () => {
                const res: DataSync = new DataSync().fromJSON({})
                assert.isUndefined(res.activities)
                assert.isUndefined(res.sleep)
                assert.isUndefined(res.weights)
                assert.isUndefined(res.logs)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: DataSync = new DataSync().fromJSON('')
                assert.isUndefined(res.activities)
                assert.isUndefined(res.sleep)
                assert.isUndefined(res.weights)
                assert.isUndefined(res.logs)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: DataSync = new DataSync().fromJSON('invalid')
                assert.isUndefined(res.activities)
                assert.isUndefined(res.sleep)
                assert.isUndefined(res.weights)
                assert.isUndefined(res.logs)
            })
        })
    })

    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: DataSync = new DataSync().fromJSON(DefaultEntityMock.DATA_SYNC)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.DATA_SYNC)
            })
        })
        context('when the model parameters are undefined', () => {
            it('should return a json with undefined parameters', () => {
                const model: DataSync = new DataSync().fromJSON({})
                const res: any = model.toJSON()
                assert.isUndefined(res.activities)
                assert.isUndefined(res.sleep)
                assert.isUndefined(res.weights)
                assert.isUndefined(res.logs)
            })
        })
    })
})
