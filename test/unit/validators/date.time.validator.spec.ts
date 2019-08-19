import { assert } from 'chai'
import { DatetimeValidator } from '../../../src/application/domain/validator/date.time.validator'

describe('Validators: DateTimeValidator', () => {
    it('should return undefined when the validation was successful', () => {
        const result = DatetimeValidator.validate('2018-01-02T00:04:03.000Z')
        assert.equal(result, undefined)
    })

    context('when there are missing or invalid parameters', () => {
        it('should throw error for does pass invalid date time', () => {
            try {
                DatetimeValidator.validate('02-08-2018')
            } catch (err) {
                assert.property(err, 'message')
                assert.property(err, 'description')
                assert.equal(err.message, 'Datetime: 02-08-2018, is not in valid ISO 8601 format.')
                assert.equal(err.description, 'Date must be in the format: yyyy-MM-dd\'T\'HH:mm:ssZ')
            }
        })
    })
})
