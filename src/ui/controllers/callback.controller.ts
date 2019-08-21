import { controller, httpGet, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IFitbitAuthDataService } from '../../application/port/fitbit.auth.data.service.interface'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import HttpStatus from 'http-status-codes'
import { FitbitAuthData } from '../../application/domain/model/fitbit.auth.data'
import qs from 'query-strings-parser'

/**
 * Controller that implements Home feature operations.
 * @remarks
 * To define paths, we use library inversify-express-utils.
 *
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/v1/fitbit/callback')
export class CallbackController {
    constructor(
        @inject(Identifier.FITBIT_AUTH_DATA_SERVICE) readonly _fitbitAuthDataService: IFitbitAuthDataService<FitbitAuthData>
    ) {
    }

    /**
     * List APIRest information.
     *
     * @returns void
     */
    @httpGet('/')
    public async getAuthCode(@request() req: Request, @response() res: Response): Promise<void | Response> {
        try {
            const state: string = req.query.filters.state
            const code: string = req.query.filters.code
            if (code && state) {
                const stateQuery = qs.parser(state)
                const userId: string = stateQuery.filters.user_id
                const redirectUri: string = stateQuery.filters.redirect_uri
                await this._fitbitAuthDataService.getAccessToken(userId, code)
                return res.status(HttpStatus.NO_CONTENT).redirect(redirectUri)
            }
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code).send(handlerError.toJson())
        }
    }
}
