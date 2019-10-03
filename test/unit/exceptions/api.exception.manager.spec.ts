import { assert } from 'chai'
import { ApiExceptionManager } from '../../../src/ui/exception/api.exception.manager'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { ConflictException } from '../../../src/application/domain/exception/conflict.exception'
import { RepositoryException } from '../../../src/application/domain/exception/repository.exception'
import { OAuthException } from '../../../src/application/domain/exception/oauth.exception'
import { FitbitClientException } from '../../../src/application/domain/exception/fitbit.client.exception'
import { EventBusException } from '../../../src/application/domain/exception/eventbus.exception'

class ExceptionTest extends ApiExceptionManager {
}

describe('Exception: ApiExceptionManager', () => {
    describe('build', () => {
        it('should return a bad request for validation exceptions', () => {
            const res = ExceptionTest.build(new ValidationException('message', 'description'))
            assert.propertyVal(res, 'code', 400)
            assert.propertyVal(res, 'message', 'message')
            assert.propertyVal(res, 'description', 'description')
        })
        it('should return a conflict for conflict exceptions', () => {
            const res = ExceptionTest.build(new ConflictException('message', 'description'))
            assert.propertyVal(res, 'code', 409)
            assert.propertyVal(res, 'message', 'message')
            assert.propertyVal(res, 'description', 'description')
        })
        it('should return a internal error for repository exceptions', () => {
            const res = ExceptionTest.build(new RepositoryException('message', 'description'))
            assert.propertyVal(res, 'code', 500)
            assert.propertyVal(res, 'message', 'message')
            assert.propertyVal(res, 'description', 'description')
        })
        it('should return a bad request for oauth exceptions', () => {
            const res = ExceptionTest.build(new OAuthException('any', 'message', 'description'))
            assert.propertyVal(res, 'code', 400)
            assert.propertyVal(res, 'message', 'message')
            assert.propertyVal(res, 'description', 'description')
        })
        it('should return a service unavailable for fitbit client exceptions', () => {
            const res = ExceptionTest.build(new FitbitClientException('any', 'message', 'description'))
            assert.propertyVal(res, 'code', 503)
            assert.propertyVal(res, 'message', 'message')
            assert.propertyVal(res, 'description', 'description')
        })
        it('should return a internal error for repository exceptions', () => {
            const res = ExceptionTest.build(new Error('message'))
            assert.propertyVal(res, 'code', 500)
            assert.propertyVal(res, 'message', 'message')
        })
        it('should return a internal error for eventbus exceptions', () => {
            const res = ExceptionTest.build(new EventBusException('message'))
            assert.propertyVal(res, 'code', 500)
            assert.propertyVal(res, 'message', 'message')
        })
    })
})
