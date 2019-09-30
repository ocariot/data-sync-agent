import { assert } from 'chai'
import { VerifyFitbitAuthValidator } from '../../../src/application/domain/validator/verify.fitbit.auth.validator'
import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { FitbitAuthData } from '../../../src/application/domain/model/fitbit.auth.data'

describe('Validators: VerifyFitbitAuthValidator', () => {
    const data: FitbitAuthData = new FitbitAuthData().fromJSON(DefaultEntityMock.FITBIT_AUTH_DATA)
    it('should return undefined when the validation was successful', () => {
        const result = VerifyFitbitAuthValidator.validate(data)
        assert.equal(result, undefined)
    })

    context('when there are validation errors', () => {
        it('should throw an error for invalid token', () => {
            data.status = 'invalid_token'
            try {
                VerifyFitbitAuthValidator.validate(data)
            } catch (err) {
                assert.propertyVal(err, 'type', 'invalid_token')
                assert.propertyVal(err, 'message', `The access token is invalid: ${data.access_token}`)
                assert.propertyVal(err, 'description', 'Please make a new Fitbit Auth data and try again.')
            }
        })
        it('should throw an error for invalid grant', () => {
            data.status = 'invalid_grant'
            try {
                VerifyFitbitAuthValidator.validate(data)
            } catch (err) {
                assert.propertyVal(err, 'type', 'invalid_grant')
                assert.propertyVal(err, 'message', `The refresh token is invalid: ${data.access_token}`)
                assert.propertyVal(err, 'description', 'Please make a new Fitbit Auth data and try again.')
            } finally {
                data.status = 'valid_token'
            }
        })
        it('should throw an error for invalid grant', () => {
            data.expires_in = 1569865086
            try {
                VerifyFitbitAuthValidator.validate(data)
            } catch (err) {
                assert.propertyVal(err, 'type', 'expired_token')
                assert.propertyVal(err, 'message', 'The access token is expired.')
                assert.propertyVal(err, 'description', 'It is necessary refresh token before continue.')
            }
        })
    })
})
