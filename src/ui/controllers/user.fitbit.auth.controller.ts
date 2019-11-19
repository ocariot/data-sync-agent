import HttpStatus from 'http-status-codes'
import { controller, httpGet, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { inject } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IUserAuthDataService } from '../../application/port/user.auth.data.service.interface'
import { UserAuthData } from '../../application/domain/model/user.auth.data'
import { ApiException } from '../exception/api.exception'
import { Strings } from '../../utils/strings'

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
     * Submit the user data to sync informations from Fitbit Server.
     *
     * @returns Promise<Response>
     */
    @httpPost('/')
    public async saveAuthData(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const userAuth: UserAuthData = new UserAuthData().fromJSON({
                user_id: req.params.user_id,
                fitbit: {
                    access_token: req.body.access_token,
                    refresh_token: req.body.refresh_token,
                    token_type: 'Bearer',
                    last_sync: req.query.filters.last_sync
                }
            })
            await this._userAuthDataService.add(userAuth)
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code).send(handlerError.toJson())
        }
    }

    /**
     * Retrieves user data from Fitbit account.
     *
     * @returns Promise<Response>
     */
    @httpGet('/')
    public async getFitbitAuthData(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: UserAuthData = await this._userAuthDataService.getByUserId(req.params.user_id)
            if (!result || !result.fitbit) {
                return res.status(HttpStatus.NOT_FOUND).send(
                    new ApiException(
                        HttpStatus.NOT_FOUND,
                        Strings.FITBIT.AUTH_NOT_FOUND,
                        Strings.FITBIT.AUTH_NOT_FOUND_DESCRIPTION
                    ).toJson()
                )
            }
            return res.status(HttpStatus.OK).send(this.toJsonView(result))
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

    private toJsonView(data: UserAuthData): any {
        return {
            access_token: data.fitbit!.access_token,
            refresh_token: data.fitbit!.refresh_token,
            status: data.fitbit!.status
        }
    }
}
