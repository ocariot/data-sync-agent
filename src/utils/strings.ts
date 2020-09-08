/**
 * Class that defines variables with default values.
 *
 * @see Variables defined in .env will have preference.
 * @see Be careful not to put critical data in this file as it is not in .gitignore.
 * Sensitive data such as database, passwords and keys should be stored in secure locations.
 *
 * @abstract
 */
export abstract class Strings {
    public static readonly APP: any = {
        TITLE: 'Data Sync Agent Service',
        APP_DESCRIPTION: 'Microservice responsible for data synchronization of FitBit platform with OCARIoT platform.'
    }

    public static readonly PARAMETERS: any = {
        COULD_NOT_BE_UPDATED: 'This parameter could not be updated!'
    }

    public static readonly ENUM_VALIDATOR: any = {
        NOT_MAPPED: 'Value not mapped for ',
        NOT_MAPPED_DESC: 'The mapped values are: '
    }

    public static readonly ERROR_MESSAGE: any = {
        ENDPOINT_NOT_FOUND: 'Endpoint {0} does not found!',
        REQUEST_BODY_INVALID: 'Unable to process request body!',
        REQUEST_BODY_INVALID_DESC: 'Please verify that the JSON provided in the request body has a valid format and try again.',
        UNEXPECTED: 'An unexpected error has occurred. Please try again later...',
        UUID_NOT_VALID_FORMAT: 'Some ID provided does not have a valid format!',
        UUID_NOT_VALID_FORMAT_DESC: 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.',
        PARAMETER_COULD_NOT_BE_UPDATED: 'This parameter could not be updated.',
        OPERATION_CANT_BE_COMPLETED: 'The operation could not be performed successfully.',
        OPERATION_CANT_BE_COMPLETED_DESC: 'Probably one or more of the request parameters are incorrect.'
    }

    public static readonly FITBIT: any = {
        AUTH_NOT_FOUND: 'Unable to find Fitbit authentication data!',
        AUTH_NOT_FOUND_DESCRIPTION: 'You must enter new data before you can refer to it.',
        INVALID_ACCESS_TOKEN: 'Access token invalid: {0}. Please submit a new access token and try again.',
        INVALID_REFRESH_TOKEN: 'Access refresh invalid: {0}. Please submit a new refresh token and try again.',
        REQUEST_LIMIT_EXCEED: 'The request limit has been exceeded. Please allow an hour to make new requests.',
        INVALID_CLIENT_DATA: 'The Fitbit client credentials are invalid. The operation cannot be performed.',
        INTERNAL_ERROR: 'A internal error occurs. Please try again later.'
    }
}
