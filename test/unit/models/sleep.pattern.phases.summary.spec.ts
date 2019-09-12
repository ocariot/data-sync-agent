import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { SleepPatternSummaryData } from '../../../src/application/domain/model/sleep.pattern.summary.data'
import { SleepPatternPhasesSummary } from '../../../src/application/domain/model/sleep.pattern.phases.summary'

describe('Models: SleepPatternPhasesSummary', () => {
    describe('fromJSON()', () => {
        const summary: SleepPatternSummaryData = new SleepPatternSummaryData(10, 10000)
        context('when instance a class in constructor', () => {
            it('should return a model', () => {
                const res: SleepPatternPhasesSummary = new SleepPatternPhasesSummary(summary, summary, summary)
                assert.deepPropertyVal(res, 'awake', summary)
                assert.deepPropertyVal(res, 'asleep', summary)
                assert.deepPropertyVal(res, 'restless', summary)
            })
        })
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: SleepPatternPhasesSummary =
                    new SleepPatternPhasesSummary().fromJSON(DefaultEntityMock.SLEEP_PATTERN_PHASES_SUMMARY)
                assert.deepPropertyVal(res, 'awake', summary)
                assert.deepPropertyVal(res, 'asleep', summary)
                assert.deepPropertyVal(res, 'restless', summary)
            })
        })
        context('when convert a json string into a model', () => {
            it('should return a model', () => {
                const res: SleepPatternPhasesSummary = new SleepPatternPhasesSummary()
                    .fromJSON(JSON.stringify(DefaultEntityMock.SLEEP_PATTERN_PHASES_SUMMARY))
                assert.deepPropertyVal(res, 'awake', summary)
                assert.deepPropertyVal(res, 'asleep', summary)
                assert.deepPropertyVal(res, 'restless', summary)
            })
        })
        context('when json is invalid', () => {
            it('should return undefined parameters for undefined json', () => {
                const res: SleepPatternPhasesSummary = new SleepPatternPhasesSummary().fromJSON(undefined)
                assert.propertyVal(res, 'awake', undefined)
                assert.propertyVal(res, 'asleep', undefined)
                assert.propertyVal(res, 'restless', undefined)
            })
            it('should return undefined parameters for empty json', () => {
                const res: SleepPatternPhasesSummary = new SleepPatternPhasesSummary().fromJSON({})
                assert.propertyVal(res, 'awake', undefined)
                assert.propertyVal(res, 'asleep', undefined)
                assert.propertyVal(res, 'restless', undefined)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: SleepPatternPhasesSummary = new SleepPatternPhasesSummary().fromJSON('')
                assert.propertyVal(res, 'awake', undefined)
                assert.propertyVal(res, 'asleep', undefined)
                assert.propertyVal(res, 'restless', undefined)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: SleepPatternPhasesSummary = new SleepPatternPhasesSummary().fromJSON('invalid')
                assert.propertyVal(res, 'awake', undefined)
                assert.propertyVal(res, 'asleep', undefined)
                assert.propertyVal(res, 'restless', undefined)
            })
        })
    })

    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: SleepPatternPhasesSummary = new SleepPatternPhasesSummary()
                    .fromJSON(DefaultEntityMock.SLEEP_PATTERN_PHASES_SUMMARY)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.SLEEP_PATTERN_PHASES_SUMMARY)
            })
        })
    })
})
