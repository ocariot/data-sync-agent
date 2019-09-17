import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { assert } from 'chai'
import { UserLog } from '../../../src/application/domain/model/user.log'
import { Log } from '../../../src/application/domain/model/log'

describe('Models: UserLog', () => {
    describe('fromJSON()', () => {
        context('when convert a json into a model', () => {
            it('should return a model', () => {
                const res: UserLog = new UserLog().fromJSON(DefaultEntityMock.USER_LOG)
                assert.deepPropertyVal(res, 'steps',
                    [new Log().fromJSON(DefaultEntityMock.USER_LOG.steps[0])])
                assert.deepPropertyVal(res, 'calories',
                    [new Log().fromJSON(DefaultEntityMock.USER_LOG.calories[0])])
                assert.deepPropertyVal(res, 'active_minutes',
                    [new Log().fromJSON(DefaultEntityMock.USER_LOG.active_minutes[0])])
                assert.deepPropertyVal(res, 'lightly_active_minutes',
                    [new Log().fromJSON(DefaultEntityMock.USER_LOG.lightly_active_minutes[0])])
                assert.deepPropertyVal(res, 'sedentary_minutes',
                    [new Log().fromJSON(DefaultEntityMock.USER_LOG.sedentary_minutes[0])])
            })
        })
        context('when convert a json string into a model', () => {
            it('should return a model', () => {
                const res: UserLog = new UserLog().fromJSON(JSON.stringify(DefaultEntityMock.USER_LOG))
                assert.deepPropertyVal(res, 'steps',
                    [new Log().fromJSON(DefaultEntityMock.USER_LOG.steps[0])])
                assert.deepPropertyVal(res, 'calories',
                    [new Log().fromJSON(DefaultEntityMock.USER_LOG.calories[0])])
                assert.deepPropertyVal(res, 'active_minutes',
                    [new Log().fromJSON(DefaultEntityMock.USER_LOG.active_minutes[0])])
                assert.deepPropertyVal(res, 'lightly_active_minutes',
                    [new Log().fromJSON(DefaultEntityMock.USER_LOG.lightly_active_minutes[0])])
                assert.deepPropertyVal(res, 'sedentary_minutes',
                    [new Log().fromJSON(DefaultEntityMock.USER_LOG.sedentary_minutes[0])])
            })
        })
        context('when json is invalid', () => {
            it('should return undefined parameters for undefined json', () => {
                const res: UserLog = new UserLog().fromJSON(undefined)
                assert.propertyVal(res, 'steps', undefined)
                assert.propertyVal(res, 'calories', undefined)
                assert.propertyVal(res, 'active_minutes', undefined)
                assert.propertyVal(res, 'lightly_active_minutes', undefined)
                assert.propertyVal(res, 'sedentary_minutes', undefined)
            })
            it('should return undefined parameters for empty json', () => {
                const res: UserLog = new UserLog().fromJSON({})
                assert.propertyVal(res, 'steps', undefined)
                assert.propertyVal(res, 'calories', undefined)
                assert.propertyVal(res, 'active_minutes', undefined)
                assert.propertyVal(res, 'lightly_active_minutes', undefined)
                assert.propertyVal(res, 'sedentary_minutes', undefined)
            })
            it('should return undefined parameters for empty json string', () => {
                const res: UserLog = new UserLog().fromJSON('')
                assert.propertyVal(res, 'steps', undefined)
                assert.propertyVal(res, 'calories', undefined)
                assert.propertyVal(res, 'active_minutes', undefined)
                assert.propertyVal(res, 'lightly_active_minutes', undefined)
                assert.propertyVal(res, 'sedentary_minutes', undefined)
            })
            it('should return undefined parameters for invalid json string', () => {
                const res: UserLog = new UserLog().fromJSON('invalid')
                assert.propertyVal(res, 'steps', undefined)
                assert.propertyVal(res, 'calories', undefined)
                assert.propertyVal(res, 'active_minutes', undefined)
                assert.propertyVal(res, 'lightly_active_minutes', undefined)
                assert.propertyVal(res, 'sedentary_minutes', undefined)
            })
        })
    })

    describe('toJSON()', () => {
        context('when convert a model into a json', () => {
            it('should return a json', () => {
                const model: UserLog = new UserLog().fromJSON(DefaultEntityMock.USER_LOG)
                const res: any = model.toJSON()
                assert.deepEqual(res, DefaultEntityMock.USER_LOG)
            })
        })
        context('when the model parameters are undefined', () => {
            it('should return a json with undefined parameters', () => {
                const model: UserLog = new UserLog().fromJSON({})
                const res: any = model.toJSON()
                assert.propertyVal(res, 'steps', undefined)
                assert.propertyVal(res, 'calories', undefined)
                assert.propertyVal(res, 'active_minutes', undefined)
                assert.propertyVal(res, 'lightly_active_minutes', undefined)
                assert.propertyVal(res, 'sedentary_minutes', undefined)
            })
        })
    })

    describe('toJSONList()', () => {
        context('when convert a model into a json list', () => {
            it('should return a json list', () => {
                const model: UserLog = new UserLog().fromJSON(DefaultEntityMock.USER_LOG)
                const res: any = model.toJSONList()
                assert.deepEqual(res, [
                    ...DefaultEntityMock.USER_LOG.steps,
                    ...DefaultEntityMock.USER_LOG.calories,
                    ...DefaultEntityMock.USER_LOG.active_minutes,
                    ...DefaultEntityMock.USER_LOG.lightly_active_minutes,
                    ...DefaultEntityMock.USER_LOG.sedentary_minutes
                ])
            })
        })
        context('when the model parameters are undefined', () => {
            it('should return a empty list', () => {
                const model: UserLog = new UserLog().fromJSON({})
                const res: any = model.toJSONList()
                assert.isEmpty(res)
            })
        })
    })
})
