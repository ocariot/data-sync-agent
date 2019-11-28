import { UserAuthData } from '../model/user.auth.data'
import { ValidationException } from '../exception/validation.exception'
import { ObjectIdValidator } from './object.id.validator'
import { CreateFitbitAuthDataValidator } from './create.fitbit.auth.data.validator'

export class CreateUserAuthDataValidator {
    public static validate(item: UserAuthData): void | ValidationException {
        const fields: Array<string> = []
        const scopeException: ValidationException = new ValidationException(
            'The token must have permission for at least one of the features that are synced by the API.',
            'The features that are mapped are: rwei (weight), ract (activity), rsle (sleep).'
        )

        if (!item.user_id) fields.push('user_id')
        else ObjectIdValidator.validate(item.user_id)

        if (item.fitbit) CreateFitbitAuthDataValidator.validate(item.fitbit)

        if (!fields.length) {
            if (!item.fitbit || !item.fitbit.scope) {
                throw scopeException
            } else {
                const scopes: Array<string> = item.fitbit.scope.split(' ')
                if (!(scopes.includes('rwei') || scopes.includes('ract') || scopes.includes('rsle'))) {
                    throw scopeException
                }
            }
        }

        if (fields.length) {
            throw new ValidationException('Required fields were not provided...',
                'User Auth Validation: '.concat(fields.join(', ').concat(' required!')))
        }
    }
}
