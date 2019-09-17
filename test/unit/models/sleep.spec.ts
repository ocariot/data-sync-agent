import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { SleepPattern } from '../../../src/application/domain/model/sleep.pattern'
import { Sleep } from '../../../src/application/domain/model/sleep'

describe('Models: Sleep', () => {
    describe('fromJSON()', () => {
        const pattern: SleepPattern = new SleepPattern()
            .fromJSON(JSON.stringify(DefaultEntityMock.SLEEP_PATTERN_PHASES))
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: Sleep = new Sleep()
                    .fromJSON(JSON.stringify(DefaultEntityMock.SLEEP))
                assert.deepPropertyVal(res, 'pattern', pattern)
                assert.deepPropertyVal(res, 'type', DefaultEntityMock.SLEEP.type)
            })
        })
        context('when convert a json string into a model', () => {
            it('should return a model', () => {
                const res: Sleep = new Sleep()
                    .fromJSON(JSON.stringify(DefaultEntityMock.SLEEP))
                assert.deepPropertyVal(res, 'pattern', pattern)
                assert.deepPropertyVal(res, 'type', DefaultEntityMock.SLEEP.type)
            })
        })
        context('when json is invalid', () => {
            it('should return undefined parameters for undefined json', () => {
                const res: Sleep = new Sleep().fromJSON(undefined)
                assert.deepPropertyVal(res, 'pattern', undefined)
                assert.deepPropertyVal(res, 'type', undefined)
            })
            it('should return undefined parameters for empty json', () => {
                const res: Sleep = new Sleep().fromJSON({})
                assert.deepPropertyVal(res, 'pattern', undefined)
                assert.deepPropertyVal(res, 'type', undefined)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: Sleep = new Sleep().fromJSON('')
                assert.deepPropertyVal(res, 'pattern', undefined)
                assert.deepPropertyVal(res, 'type', undefined)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: Sleep = new Sleep().fromJSON('invalid')
                assert.deepPropertyVal(res, 'pattern', undefined)
                assert.deepPropertyVal(res, 'type', undefined)
            })
        })
    })

    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: Sleep = new Sleep().fromJSON(DefaultEntityMock.SLEEP)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.SLEEP)
            })
        })
        context('when the model parameters are undefined', () => {
            it('should return a json with undefined parameters', () => {
                const model: Sleep = new Sleep().fromJSON({})
                const res: any = model.toJSON()
                assert.deepPropertyVal(res, 'pattern', undefined)
                assert.deepPropertyVal(res, 'type', undefined)
            })
        })
    })
})
