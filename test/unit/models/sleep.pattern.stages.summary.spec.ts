import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { SleepPatternStagesSummary } from '../../../src/application/domain/model/sleep.pattern.stages.summary'
import { SleepPatternSummaryData } from '../../../src/application/domain/model/sleep.pattern.summary.data'

describe('Models: SleepPatternStagesSummary', () => {
    describe('fromJSON()', () => {
        const summary: SleepPatternSummaryData = new SleepPatternSummaryData(10, 10000)
        context('when instance a class in constructor', () => {
            it('should return a model', () => {
                const res: SleepPatternStagesSummary = new SleepPatternStagesSummary(summary, summary, summary, summary)
                assert.deepPropertyVal(res, 'deep', summary)
                assert.deepPropertyVal(res, 'light', summary)
                assert.deepPropertyVal(res, 'rem', summary)
                assert.deepPropertyVal(res, 'wake', summary)
            })
        })
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: SleepPatternStagesSummary =
                    new SleepPatternStagesSummary().fromJSON(DefaultEntityMock.SLEEP_PATTERN_STAGES_SUMMARY)
                assert.deepPropertyVal(res, 'deep', summary)
                assert.deepPropertyVal(res, 'light', summary)
                assert.deepPropertyVal(res, 'rem', summary)
                assert.deepPropertyVal(res, 'wake', summary)
            })
        })
        context('when convert a json string into a model', () => {
            it('should return a model', () => {
                const res: SleepPatternStagesSummary = new SleepPatternStagesSummary()
                    .fromJSON(JSON.stringify(DefaultEntityMock.SLEEP_PATTERN_STAGES_SUMMARY))
                assert.deepPropertyVal(res, 'deep', summary)
                assert.deepPropertyVal(res, 'light', summary)
                assert.deepPropertyVal(res, 'rem', summary)
                assert.deepPropertyVal(res, 'wake', summary)
            })
        })
        context('when json is invalid', () => {
            it('should return undefined parameters for undefined json', () => {
                const res: SleepPatternStagesSummary = new SleepPatternStagesSummary().fromJSON(undefined)
                assert.propertyVal(res, 'deep', undefined)
                assert.propertyVal(res, 'light', undefined)
                assert.propertyVal(res, 'rem', undefined)
                assert.propertyVal(res, 'wake', undefined)
            })
            it('should return undefined parameters for empty json', () => {
                const res: SleepPatternStagesSummary = new SleepPatternStagesSummary().fromJSON({})
                assert.propertyVal(res, 'deep', undefined)
                assert.propertyVal(res, 'light', undefined)
                assert.propertyVal(res, 'rem', undefined)
                assert.propertyVal(res, 'wake', undefined)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: SleepPatternStagesSummary = new SleepPatternStagesSummary().fromJSON('')
                assert.propertyVal(res, 'deep', undefined)
                assert.propertyVal(res, 'light', undefined)
                assert.propertyVal(res, 'rem', undefined)
                assert.propertyVal(res, 'wake', undefined)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: SleepPatternStagesSummary = new SleepPatternStagesSummary().fromJSON('invalid')
                assert.propertyVal(res, 'deep', undefined)
                assert.propertyVal(res, 'light', undefined)
                assert.propertyVal(res, 'rem', undefined)
                assert.propertyVal(res, 'wake', undefined)
            })
        })
    })

    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: SleepPatternStagesSummary = new SleepPatternStagesSummary()
                    .fromJSON(DefaultEntityMock.SLEEP_PATTERN_STAGES_SUMMARY)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.SLEEP_PATTERN_STAGES_SUMMARY_JSON)
            })
        })
    })
})
