import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { expect } from 'chai'
import { DIContainer } from '../../../src/di/di'

const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: FitbitSubscriber', () => {
    describe('GET /v1/fitbit/subscriber', () => {
        context('when validate fitbit client subscriber', () => {
            it('should return status code 204 and no content', () => {
                return request
                    .get(`/v1/fitbit/subscriber?verify=${process.env.FITBIT_CLIENT_SUBSCRIBER}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })
        context('when the verification fails', () => {
            it('should return status code 404 and no content', () => {
                return request
                    .get('/v1/fitbit/subscriber?verify=invalid')
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })
    })
    describe('POST /v1/fitbit/subscriber', () => {
        context('when the client receive a subscribe notification', () => {
            it('should return status code 200 and no content', () => {
                return request
                    .post('/v1/fitbit/subscriber')
                    .send([{
                        ownerId: '1A2B3',
                        collectionType: 'body',
                        date: '2019-09-18'
                    }])
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })
    })
})
