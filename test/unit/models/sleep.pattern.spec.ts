import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { SleepPattern } from '../../../src/application/domain/model/sleep.pattern'
import { SleepPatternDataSet } from '../../../src/application/domain/model/sleep.pattern.data.set'
import { SleepPatternPhasesSummary } from '../../../src/application/domain/model/sleep.pattern.phases.summary'
import { SleepPatternStagesSummary } from '../../../src/application/domain/model/sleep.pattern.stages.summary'

describe('Models: SleepPattern', () => {
    describe('fromJSON()', () => {
        const dataset: Array<SleepPatternDataSet> =
            [new SleepPatternDataSet().fromJSON(DefaultEntityMock.SLEEP_PATTERN_DATA_SET)]
        const phases: SleepPatternPhasesSummary =
            new SleepPatternPhasesSummary().fromJSON(DefaultEntityMock.SLEEP_PATTERN_PHASES_SUMMARY)
        const stages: SleepPatternStagesSummary =
            new SleepPatternStagesSummary().fromJSON(DefaultEntityMock.SLEEP_PATTERN_STAGES_SUMMARY)
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: SleepPattern = new SleepPattern()
                    .fromJSON(JSON.stringify(DefaultEntityMock.SLEEP_PATTERN_PHASES))
                assert.deepPropertyVal(res, 'data_set', dataset)
                assert.deepPropertyVal(res, 'summary',  phases)
            })
        })
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: SleepPattern = new SleepPattern()
                    .fromJSON(JSON.stringify(DefaultEntityMock.SLEEP_PATTERN_STAGES))
                assert.deepPropertyVal(res, 'data_set', dataset)
                assert.deepPropertyVal(res, 'summary',  stages)
            })
        })
        context('when convert a json string into a model', () => {
            it('should return a model', () => {
                const res: SleepPattern = new SleepPattern()
                    .fromJSON(JSON.stringify(DefaultEntityMock.SLEEP_PATTERN_PHASES))
                assert.deepPropertyVal(res, 'data_set', dataset)
                assert.deepPropertyVal(res, 'summary',  phases)
            })
        })
        context('when json is invalid', () => {
            it('should return undefined parameters for undefined json', () => {
                const res: SleepPattern = new SleepPattern().fromJSON(undefined)
                assert.deepPropertyVal(res, 'data_set', undefined)
                assert.deepPropertyVal(res, 'summary', undefined)
            })
            it('should return undefined parameters for empty json', () => {
                const res: SleepPattern = new SleepPattern().fromJSON({})
                assert.deepPropertyVal(res, 'data_set', undefined)
                assert.deepPropertyVal(res, 'summary', undefined)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: SleepPattern = new SleepPattern().fromJSON('')
                assert.deepPropertyVal(res, 'data_set', undefined)
                assert.deepPropertyVal(res, 'summary', undefined)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: SleepPattern = new SleepPattern().fromJSON('invalid')
                assert.deepPropertyVal(res, 'data_set', undefined)
                assert.deepPropertyVal(res, 'summary', undefined)
            })
        })
    })

    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: SleepPattern =
                    new SleepPattern().fromJSON(DefaultEntityMock.SLEEP_PATTERN_PHASES)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.SLEEP_PATTERN_PHASES)
            })
        })
        context('when the model parameters are undefined', () => {
            it('should return a json with undefined parameters', () => {
                const model: SleepPattern = new SleepPattern().fromJSON({})
                const res: any = model.toJSON()
                assert.deepPropertyVal(res, 'data_set', undefined)
                assert.deepPropertyVal(res, 'summary', undefined)
            })
        })
    })
})
