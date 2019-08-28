import { UserAuthData } from '../model/user.auth.data'
import { ValidationException } from '../exception/validation.exception'
import { ObjectIdValidator } from './object.id.validator'
import { DatetimeValidator } from './date.time.validator'
import { CreateFitbitAuthDataValidator } from './create.fitbit.auth.data.validator'

export class CreateUserAuthDataValidator {
    public static validate(item: UserAuthData): void | ValidationException {
        const fields: Array<string> = []

        if (!item.user_id) fields.push('user_id')
        else ObjectIdValidator.validate(item.user_id)
        if (item.last_sync) DatetimeValidator.validate(item.last_sync)
        if (item.fitbit) CreateFitbitAuthDataValidator.validate(item.fitbit)

        if (fields.length) {
            throw new ValidationException('Required fields were not provided...',
                'User Auth Validation:'.concat(fields.join(', ').concat(' required!')))
        }
    }
}
