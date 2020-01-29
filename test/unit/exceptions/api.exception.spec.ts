import { ApiException } from '../../../src/ui/exception/api.exception'
import { assert } from 'chai'

describe('Exception: ApiException', () => {
    describe('toJSON()', () => {
        context('when transform a exceptions in a json', () => {
            it('should return a json', () => {
                const result: any = new ApiException(400, 'message', 'description').toJSON()
                assert.deepEqual(result, { code: 400, message: 'message', description: 'description' })
            })
        })
    })
})
