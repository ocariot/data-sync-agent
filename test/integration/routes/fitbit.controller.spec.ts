import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { expect } from 'chai'
import { DIContainer } from '../../../src/di/di'

const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: Fitbit', () => {
    describe('GET /v1/fitbit', () => {
        context('when get fitbit client data', () => {
            it('should return status code 200 and fitbit client data', () => {
                return request
                    .get('/v1/fitbit')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('client_id', process.env.FITBIT_CLIENT_ID)
                        expect(res.body).to.have.property('client_secret', process.env.FITBIT_CLIENT_SECRET)
                    })
            })
        })
    })
})
