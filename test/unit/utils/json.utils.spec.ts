import { JsonUtils } from '../../../src/application/domain/utils/json.utils'
import { assert } from 'chai'

describe('Utils: JsonUtils', () => {
    describe('isJsonString()', () => {
        context('when validate if a string is a json', () => {
            it('should return true', () => {
                const res: boolean = JsonUtils.isJsonString('{"a": "1"}')
                assert.isTrue(res)
            })
        })
        context('when a string is invalid', () => {
            it('should return false', () => {
                const res: boolean = JsonUtils.isJsonString('invalid')
                assert.isFalse(res)
            })
        })
        context('when a string is empty', () => {
            it('should return false', () => {
                const res: boolean = JsonUtils.isJsonString('')
                assert.isFalse(res)
            })
        })
    })
    describe('cleanObject()', () => {
        context('when clean json with undefined/null parameters', () => {
            const res: any = JsonUtils.cleanObject({ a: 1, b: undefined, c: null, d: [{ a: 1, b: undefined }] })
            assert.notProperty(res, 'b')
            assert.notProperty(res, 'c')
            assert.propertyVal(res, 'a', 1)
            assert.deepPropertyVal(res, 'd', [{ a: 1 }])
        })
    })
})
