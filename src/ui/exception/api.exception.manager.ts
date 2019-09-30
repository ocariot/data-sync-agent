import HttpStatus from 'http-status-codes'
import { Exception } from '../../application/domain/exception/exception'
import { ValidationException } from '../../application/domain/exception/validation.exception'
import { ApiException } from './api.exception'
import { ConflictException } from '../../application/domain/exception/conflict.exception'
import { RepositoryException } from '../../application/domain/exception/repository.exception'
import { OAuthException } from '../../application/domain/exception/oauth.exception'
import { FitbitClientException } from '../../application/domain/exception/fitbit.client.exception'

/**
 * Treats the exceptions types of the application and converts
 * to api exceptions which should be returned in json format for the client.
 *
 * @abstract
 */
export abstract class ApiExceptionManager {

    /**
     * Constructs instance of ApiException.
     *
     * @param err
     */
    public static build(err: Exception): ApiException {
        if (err instanceof ValidationException) {
            return new ApiException(HttpStatus.BAD_REQUEST, err.message, err.description)
        } else if (err instanceof ConflictException) {
            return new ApiException(HttpStatus.CONFLICT, err.message, err.description)
        } else if (err instanceof RepositoryException) {
            return new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, err.message, err.description)
        } else if (err instanceof OAuthException) {
            return new ApiException(HttpStatus.BAD_REQUEST, err.message, err.description)
        } else if (err instanceof FitbitClientException) {
            return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, err.message, err.description)
        }
        return new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, err.message, err.description)
    }
}
