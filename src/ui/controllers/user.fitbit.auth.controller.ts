import HttpStatus from 'http-status-codes'
import { controller, httpGet, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { inject } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IFitbitAuthDataService } from '../../application/port/fitbit.auth.data.service.interface'
import { FitbitAuthData } from '../../application/domain/model/fitbit.auth.data'

/**
 * Controller that implements User Fitbit Auth feature operations.
 * @remarks
 * To define paths, we use library inversify-express-utils.
 *
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/v1/users/:user_id/fitbit/auth')
export class UserFitbitAuthController {
    constructor(
        @inject(Identifier.FITBIT_AUTH_DATA_SERVICE)
        private readonly _fitbitAuthDataService: IFitbitAuthDataService<FitbitAuthData>
    ) {
    }

    /**
     * Submit the user user data to sync informations from Fitbit Server.
     *
     * @returns Promise<Response>
     */
    @httpPost('/')
    public async saveAuthData(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._fitbitAuthDataService.add(new FitbitAuthData().fromJSON({ ...req.body, user_id: req.params.user_id }))
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code).send(handlerError.toJson())
        }
    }

    /**
     * Get the user user data to sync informations from Fitbit Server.
     *
     * @returns Promise<Response>
     */
    @httpGet('/')
    public async getAuthData(@request() req: Request, @response() res: Response): Promise<Response | void> {
        try {
            const url: string =
                await this._fitbitAuthDataService.getAuthorizeUrl(req.params.user_id, req.query.filters.redirect_uri)
            return res.status(HttpStatus.MOVED_PERMANENTLY).redirect(url)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code).send(handlerError.toJson())
        }
    }

    /**
     * Request the auth token revoke from user.
     *
     * @returns Promise<Response>
     */
    @httpPost('/revoke')
    public async revokeAuthToken(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._fitbitAuthDataService.revokeTokenFromUser(req.params.user_id)
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code).send(handlerError.toJson())
        }
    }
}
