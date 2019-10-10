import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { SleepPatternDataSet } from '../../../src/application/domain/model/sleep.pattern.data.set'

describe('Models: SleepPatternDataSet', () => {
    describe('fromJSON()', () => {
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: SleepPatternDataSet =
                    new SleepPatternDataSet().fromJSON(DefaultEntityMock.SLEEP_PATTERN_DATA_SET)
                assert.deepPropertyVal(res, 'start_time', DefaultEntityMock.ACTIVITY.start_time)
                assert.propertyVal(res, 'duration', DefaultEntityMock.SLEEP_PATTERN_DATA_SET.duration)
                assert.propertyVal(res, 'name', DefaultEntityMock.SLEEP_PATTERN_DATA_SET.name)
            })
        })
        context('when convert a json string into a model', () => {
            it('should return a model', () => {
                const res: SleepPatternDataSet =
                    new SleepPatternDataSet().fromJSON(JSON.stringify(DefaultEntityMock.SLEEP_PATTERN_DATA_SET))
                assert.deepPropertyVal(res, 'start_time', DefaultEntityMock.ACTIVITY.start_time)
                assert.propertyVal(res, 'duration', DefaultEntityMock.SLEEP_PATTERN_DATA_SET.duration)
                assert.propertyVal(res, 'name', DefaultEntityMock.SLEEP_PATTERN_DATA_SET.name)
            })
        })
        context('when json is invalid', () => {
            it('should return undefined parameters for undefined json', () => {
                const res: SleepPatternDataSet = new SleepPatternDataSet().fromJSON(undefined)
                assert.propertyVal(res, 'start_time', undefined)
                assert.propertyVal(res, 'duration', undefined)
                assert.propertyVal(res, 'name', undefined)
            })
            it('should return undefined parameters for empty json', () => {
                const res: SleepPatternDataSet = new SleepPatternDataSet().fromJSON({})
                assert.propertyVal(res, 'start_time', undefined)
                assert.propertyVal(res, 'duration', undefined)
                assert.propertyVal(res, 'name', undefined)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: SleepPatternDataSet = new SleepPatternDataSet().fromJSON('')
                assert.propertyVal(res, 'start_time', undefined)
                assert.propertyVal(res, 'duration', undefined)
                assert.propertyVal(res, 'name', undefined)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: SleepPatternDataSet = new SleepPatternDataSet().fromJSON('invalid')
                assert.propertyVal(res, 'start_time', undefined)
                assert.propertyVal(res, 'duration', undefined)
                assert.propertyVal(res, 'name', undefined)
            })
        })
    })

    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: SleepPatternDataSet =
                    new SleepPatternDataSet().fromJSON(DefaultEntityMock.SLEEP_PATTERN_DATA_SET)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.SLEEP_PATTERN_DATA_SET)
            })
            it('should return a json', () => {
                const wake = {
                    start_time: '2019-09-12T13:36:49.741Z',
                    name: 'wake',
                    duration: 10000
                }
                const awake = {
                    start_time: '2019-09-12T13:36:49.741Z',
                    name: 'awake',
                    duration: 10000
                }
                const model: SleepPatternDataSet =
                    new SleepPatternDataSet().fromJSON(wake)
                const res: any = model.toJSON()
                assert.deepEqual(res, awake)
            })
        })
        context('when the model parameters are undefined', () => {
            it('should return a json with undefined parameters', () => {
                const model: SleepPatternDataSet = new SleepPatternDataSet().fromJSON({})
                const res: any = model.toJSON()
                assert.propertyVal(res, 'start_time', undefined)
                assert.propertyVal(res, 'duration', undefined)
                assert.propertyVal(res, 'name', undefined)
            })
        })
    })
})
