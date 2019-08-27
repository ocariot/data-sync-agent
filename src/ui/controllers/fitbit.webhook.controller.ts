import { controller, httpGet, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IFitbitAuthDataService } from '../../application/port/fitbit.auth.data.service.interface'
import HttpStatus from 'http-status-codes'
import { FitbitAuthData } from '../../application/domain/model/fitbit.auth.data'

@controller('/v1/fitbit/webhook')
export class FitbitWebhookController {
    constructor(
        @inject(Identifier.FITBIT_AUTH_DATA_SERVICE) readonly _fitbitAuthDataService: IFitbitAuthDataService<FitbitAuthData>
    ) {
    }

    @httpGet('/')
    public async verifySubscriber(@request() req: Request, @response() res: Response): Promise<Response> {
        return req.query.filters.verify && req.query.filters.verify === `${process.env.FITBIT_CLIENT_SUBSCRIBER}` ?
            // should return 204 if the verify query matches
            res.status(HttpStatus.NO_CONTENT).send() :
            // should return 404 if the code will not match
            res.status(HttpStatus.NOT_FOUND).send({ message: 'Webhook verification failed!' })
    }

    @httpPost('/')
    public async getInfo(@request() req: Request, @response() res: Response): Promise<Response> {
        console.log('i was called with', req.body)
        return res.status(200)
    }
}
