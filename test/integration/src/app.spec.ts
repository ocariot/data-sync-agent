import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { expect } from 'chai'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { Default } from '../../../src/utils/default'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('App', () => {

    before(async () => {
            try {
                await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST, { interval: 100 })
            } catch (err) {
                throw new Error('Failure on App test: ' + err.message)
            }
        }
    )

    after(async () => {
        try {
            await dbConnection.dispose()
        } catch (err) {
            throw new Error('Failure on App test: ' + err.message)
        }
    })

    /**
     * setupErrorsHandler()
     */
    describe('setupErrorsHandler()', () => {
        context('when post on a route that does not exist', () => {
            it('should return status code 404 and an info message about the lack of the route', () => {
                return request
                    .post('/v1/resource')
                    .send({})
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(res => {
                        expect(res.body.code).to.eql(404)
                        expect(res.body.message).to.eql('/v1/resource not found.')
                        expect(res.body.description)
                            .to.eql('Specified resource: /v1/resource was not found or does not exist.')
                    })
            })
        })

        context('when there is a POST attempt with an invalid body', () => {
            it('should return status code 400 and an info message about the invalid body', () => {
                const wrongBody: string = 'wrong body'

                return request
                    .post('/v1/users/5a62be07de34500146d9c544/fitbit/auth')
                    .send(wrongBody)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Unable to process request body.')
                        expect(err.body.description).to.eql('Please verify that the JSON provided in the request ' +
                            'body has a valid format and try again.')
                    })
            })
        })
    })
})
