import { FitbitAuthData } from '../model/fitbit.auth.data'
import { ValidationException } from '../exception/validation.exception'
import { DatetimeValidator } from './date.time.validator'

export class CreateFitbitAuthDataValidator {
    public static validate(item: FitbitAuthData): void | ValidationException {
        const fields: Array<string> = []

        if (!item.access_token) fields.push('access_token')
        if (!item.refresh_token) fields.push('refresh_token')
        if (item.last_sync) DatetimeValidator.validate(item.last_sync)

        if (fields.length) {
            throw new ValidationException('Required fields were not provided...',
                'Fitbit Auth Data Validation: '.concat(fields.join(', ').concat(' required!')))
        }
    }
}
