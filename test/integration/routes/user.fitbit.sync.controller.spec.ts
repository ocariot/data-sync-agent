import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { expect } from 'chai'
import { DIContainer } from '../../../src/di/di'

const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: UserFitbitSyncController', () => {
    describe('POST /v1/users/:user_id/fitbit/sync', () => {
        context('when a validation error occurs', () => {
            it('should return status code 400 and message from invalid parameter', () => {
                return request
                    .post('/v1/users/123/fitbit/sync')
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
