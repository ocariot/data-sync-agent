import { FitbitAuthData } from '../model/fitbit.auth.data'
import { ValidationException } from '../exception/validation.exception'

export class CreateFitbitAuthDataValidator {
    public static validate(item: FitbitAuthData): void | ValidationException {
        const fields: Array<string> = []

        if (!item.access_token) fields.push('access_token')
        if (!item.expires_in) fields.push('expires_in')
        if (!item.refresh_token) fields.push('refresh_token')
        if (!item.scope) fields.push('scope')
        if (!item.user_id) fields.push('user_id')
        if (!item.token_type) fields.push('token_type')

        if (fields.length) {
            throw new ValidationException('Required fields were not provided...',
                'Fitbit Auth Data Validation:'.concat(fields.join(', ').concat(' required!')))
        }
    }
}
