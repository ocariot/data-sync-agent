import HttpStatus from 'http-status-codes'
import { controller, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { inject } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IUserAuthDataService } from '../../application/port/user.auth.data.service.interface'
import { UserAuthData } from '../../application/domain/model/user.auth.data'

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
        @inject(Identifier.USER_AUTH_DATA_SERVICE) private readonly _userAuthDataService: IUserAuthDataService
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
            await this._userAuthDataService.add(new UserAuthData().fromJSON({
                user_id: req.params.user_id,
                fitbit: { ...req.body, last_sync: req.query.filters.last_sync ? req.query.filters.last_sync : undefined }
            }))
            return res.status(HttpStatus.NO_CONTENT).send()
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
            await this._userAuthDataService.revokeFitbitAccessToken(req.params.user_id)
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code).send(handlerError.toJson())
        }
    }
}
