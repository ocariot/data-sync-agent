import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { expect } from 'chai'
import { DIContainer } from '../../../src/di/di'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { Default } from '../../../src/utils/default'
import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { UserAuthRepoModel } from '../../../src/infrastructure/database/schema/oauth.data.schema'
import { Strings } from '../../../src/utils/strings'

const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())
const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)

describe('Routes: UserFitbitAuthController', () => {

    before(async () => {
            try {
                await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST, { interval: 100 })
                await deleteAll({})
                await saveData(DefaultEntityMock.USER_AUTH_DATA)
            } catch (err) {
                throw new Error('Failure on Educator test: ' + err.message)
            }
        }
    )
    after(async () => {
        try {
            await deleteAll({})
            await dbConnection.dispose()
        } catch (err) {
            throw new Error('Failure on Educator test: ' + err.message)
        }
    })
    describe('POST /v1/users/:user_id/fitbit/auth', () => {
        context('when a validation error occurs', () => {
            it('should return status code 400 and message from invalid parameter', () => {
                return request
                    .post('/v1/users/123/fitbit/auth')
                    .send(DefaultEntityMock.FITBIT_AUTH_DATA_BEFORE)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(res => {
                        expect(res.body).to.have.property('message', 'Some ID provided does not have a valid format!')
                        expect(res.body).to.have.property('description',
                            'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.')
                    })
            })
        })
    })
    describe('GET /v1/users/:user_id/fitbit/auth', () => {
        context('when get fitbit auth data', () => {
            it('should return status code 200 and fitbit auth data', () => {
                return request
                    .get(`/v1/users/${DefaultEntityMock.USER_AUTH_DATA.user_id}/fitbit/auth`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('access_token', DefaultEntityMock.FITBIT_AUTH_DATA.access_token)
                        expect(res.body).to.have.property('refresh_token', DefaultEntityMock.FITBIT_AUTH_DATA.refresh_token)
                        expect(res.body).to.have.property('status', DefaultEntityMock.FITBIT_AUTH_DATA.status)
                    })
            })
        })
        context('when auth data is not found', () => {
            it('should return status code 404 and message from auth darta not found', () => {
                return request
                    .get(`/v1/users/${DefaultEntityMock.USER_IDS.does_not_exists}/fitbit/auth`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(res => {
                        expect(res.body).to.have.property('message', Strings.FITBIT.AUTH_NOT_FOUND)
                        expect(res.body).to.have.property('description', Strings.FITBIT.AUTH_NOT_FOUND_DESCRIPTION)
                    })
            })
        })
        context('when a validation error occurs', () => {
            it('should return status code 400 and message from invalid parameter', () => {
                return request
                    .get('/v1/users/123/fitbit/auth')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(res => {
                        expect(res.body).to.have.property('message', 'Some ID provided does not have a valid format!')
                        expect(res.body).to.have.property('description',
                            'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.')
                    })
            })
        })
    })
    describe('POST /v1/users/:user_id/fitbit/auth/revoke', () => {
        context('when a validation error occurs', () => {
            it('should return status code 400 and message from invalid parameter', () => {
                return request
                    .post('/v1/users/123/fitbit/auth/revoke')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(res => {
                        expect(res.body).to.have.property('message', 'Some ID provided does not have a valid format!')
                        expect(res.body).to.have.property('description',
                            'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.')
                    })
            })
        })
    })
})

function saveData(data) {
    UserAuthRepoModel.create(data).then(res => Promise.resolve(res)).catch(err => Promise.reject(err))
}

function deleteAll(query) {
    UserAuthRepoModel.deleteMany(query).then(res => Promise.resolve(res)).catch(err => Promise.reject(err))
}
