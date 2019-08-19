import HttpStatus from 'http-status-codes'
import { controller, httpGet, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { inject } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IFitbitAuthDataService } from '../../application/port/fitbit.auth.data.service.interface'
import { FitbitAuthData } from '../../application/domain/model/fitbit.auth.data'

/**
 * Controller that implements Children Fitbit Auth feature operations.
 * @remarks
 * To define paths, we use library inversify-express-utils.
 *
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/v1/children/:child_id/fitbit/auth')
export class ChildrenFitbitAuthController {
    constructor(
        @inject(Identifier.FITBIT_AUTH_DATA_SERVICE) private readonly _fitbitAuthDataService: IFitbitAuthDataService
    ) {
    }

    /**
     * Submit the user child data to sync informations from Fitbit Server.
     *
     * @returns Promise<Response>
     */
    @httpPost('/')
    public async saveAuthData(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._fitbitAuthDataService.add(new FitbitAuthData().fromJSON({ ...req.body, child_id: req.params.child_id }))
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code).send(handlerError.toJson())
        }
    }

    /**
     * Get the user child data to sync informations from Fitbit Server.
     *
     * @returns Promise<Response>
     */
    @httpGet('/')
    public async getAuthData(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            return res.status(HttpStatus.MOVED_PERMANENTLY).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code).send(handlerError.toJson())
        }
    }

    /**
     * Request the auth token revoke from child.
     *
     * @returns Promise<Response>
     */
    @httpPost('/revoke')
    public async revokeAuthToken(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code).send(handlerError.toJson())
        }
    }
}
