import { assert } from 'chai'
import { CreateFitbitAuthDataValidator } from '../../../src/application/domain/validator/create.fitbit.auth.data.validator'
import { FitbitAuthData } from '../../../src/application/domain/model/fitbit.auth.data'
import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'

describe('Validators: CreateFitbitAuthDataValidator', () => {
    const item: FitbitAuthData = new FitbitAuthData().fromJSON(DefaultEntityMock.FITBIT_AUTH_DATA)
    it('should return undefined when the validation was successful', () => {
        const result = CreateFitbitAuthDataValidator.validate(item)
        assert.equal(result, undefined)
    })
    context('when there are validation errors', () => {
        it('should throw an error for does no pass access token', () => {
            item.access_token = undefined
            item.last_sync = undefined
            try {
                CreateFitbitAuthDataValidator.validate(item)
            } catch (err) {
                assert.propertyVal(err, 'message', 'Required fields were not provided...')
                assert.propertyVal(err, 'description', 'Fitbit Auth Data Validation: access_token required!')
            } finally {
                item.access_token = DefaultEntityMock.FITBIT_AUTH_DATA.access_token
            }
        })
        it('should throw an error for does no pass refresh token', () => {
            item.refresh_token = undefined
            try {
                CreateFitbitAuthDataValidator.validate(item)
            } catch (err) {
                assert.propertyVal(err, 'message', 'Required fields were not provided...')
                assert.propertyVal(err, 'description', 'Fitbit Auth Data Validation: refresh_token required!')
            } finally {
                item.refresh_token = DefaultEntityMock.FITBIT_AUTH_DATA.refresh_token
            }
        })
        it('should throw an error for does pass invalid last sync', () => {
            item.last_sync = '12/12/2012'
            try {
                CreateFitbitAuthDataValidator.validate(item)
            } catch (err) {
                assert.propertyVal(err, 'message', 'Datetime: 12/12/2012, is not in valid ISO 8601 format.')
                assert.propertyVal(err, 'description', 'Date must be in the format: yyyy-MM-dd\'T\'HH:mm:ssZ')
            } finally {
                item.last_sync = DefaultEntityMock.FITBIT_AUTH_DATA.last_sync
            }
        })
    })
})
