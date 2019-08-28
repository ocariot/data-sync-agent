import { controller, httpGet, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IUserAuthDataService } from '../../application/port/user.auth.data.service.interface'
import HttpStatus from 'http-status-codes'
import { FitbitAuthData } from '../../application/domain/model/fitbit.auth.data'

@controller('/v1/fitbit/subscriber')
export class FitbitSubscriberController {
    constructor(
        @inject(Identifier.FITBIT_AUTH_DATA_SERVICE) readonly _fitbitAuthDataService: IUserAuthDataService<FitbitAuthData>
    ) {
    }

    @httpGet('/')
    public async verifySubscriberDefault(@request() req: Request, @response() res: Response): Promise<Response> {
        return req.query.filters.verify && req.query.filters.verify === `${process.env.FITBIT_CLIENT_SUBSCRIBER}` ?
            res.status(HttpStatus.NO_CONTENT).send() : res.status(HttpStatus.NOT_FOUND).send()
    }

    @httpPost('/')
    public async getInfo(@request() req: Request, @response() res: Response): Promise<Response> {
        console.log('i was called with', req.body)
        return res.status(200).send({received: true, resource: req.body[0].collectionType})
    }
}
