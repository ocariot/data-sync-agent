import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { SleepPatternSummaryData } from '../../../src/application/domain/model/sleep.pattern.summary.data'

describe('Models: SleepPatternSummaryData', () => {
    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: SleepPatternSummaryData = new SleepPatternSummaryData(10, 10000)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.SLEEP_PATTERN_SUMMARY_DATA)
            })
        })
        context('when the model parameters are undefined', () => {
            it('should return a json with undefined parameters', () => {
                const model: SleepPatternSummaryData = new SleepPatternSummaryData(undefined!, undefined!)
                model.count = undefined!
                model.duration = undefined!
                const res: any = model.toJSON()
                assert.propertyVal(res, 'count', undefined)
                assert.propertyVal(res, 'duration', undefined)
            })
        })
    })
})
