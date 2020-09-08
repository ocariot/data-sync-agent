import { ValidationException } from '../exception/validation.exception'
import { UserAuthData } from '../model/user.auth.data'

export class AccessTokenScopesValidator {
    public static validate(item: UserAuthData): void | ValidationException {
        const scopeException: ValidationException = new ValidationException(
            'The token must have permission for at least one of the features that are synced by the API.',
            'The features that are mapped are: rwei (weight), ract (activity), rsle (sleep).'
        )
        if (!item.fitbit || !item.fitbit.scope) {
            throw scopeException
        } else {
            const scopes: Array<string> = item.fitbit.scope.split(' ')
            if (!(scopes.includes('rwei') || scopes.includes('ract') || scopes.includes('rsle'))) {
                throw scopeException
            }
        }
    }
}
