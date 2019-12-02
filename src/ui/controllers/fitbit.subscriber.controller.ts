import { controller, httpGet, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IUserAuthDataService } from '../../application/port/user.auth.data.service.interface'
import { ILogger } from '../../utils/custom.logger'

@controller('/v1/fitbit/subscriber')
export class FitbitSubscriberController {
    constructor(
        @inject(Identifier.USER_AUTH_DATA_SERVICE) private readonly _userAuthDataService: IUserAuthDataService,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    @httpGet('/')
    public async verifySubscriberDefault(@request() req: Request, @response() res: Response): Promise<Response> {
        return req.query.filters.verify && req.query.filters.verify === `${process.env.FITBIT_CLIENT_SUBSCRIBER}` ?
            res.status(HttpStatus.NO_CONTENT).send() : res.status(HttpStatus.NOT_FOUND).send()
    }

    @httpPost('/')
    public async getInfo(@request() req: Request, @response() res: Response): Promise<Response> {
        this._logger.info(`Prepare to sync ${req.body[0].collectionType} from ${req.body[0].ownerId}.`)
        this._userAuthDataService.syncLastFitbitUserData(req.body[0].ownerId, req.body[0].collectionType, req.body[0].date).then()
        return res.status(200).send()
    }
}
