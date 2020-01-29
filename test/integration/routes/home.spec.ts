import { expect } from 'chai'
import { App } from '../../../src/app'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'

const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Rotes: HomeController', () => {
    describe('/', () => {
        it('should return status code 301 with redirection to /v1/reference', () => {
            return request
                .get(`/`)
                .set('Accept', 'application/json')
                .expect(301)
                .then(res => {
                    expect(res.headers.location).to.equal('/v1/reference')
                })
        })
    })
})
