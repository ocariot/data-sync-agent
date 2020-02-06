import HttpStatus from 'http-status-codes'
import { controller, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { inject } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IUserAuthDataService } from '../../application/port/user.auth.data.service.interface'
import { DataSync } from '../../application/domain/model/data.sync'

/**
 * Controller that implements User Fitbit Sync feature operations.
 * @remarks
 * To define paths, we use library inversify-express-utils.
 *
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/v1/users/:user_id/fitbit/sync')
export class UserFitbitSyncController {
    constructor(
        @inject(Identifier.USER_AUTH_DATA_SERVICE) private readonly _userAuthDataService: IUserAuthDataService
    ) {
    }

    /**
     * Request the data sync from user.
     *
     * @returns Promise<Response>
     */
    @httpPost('/')
    public async requestDataSync(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: DataSync = await this._userAuthDataService.syncFitbitDataFromUser(req.params.user_id)
            return res.status(HttpStatus.ACCEPTED).send(result.toJSON())
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            if (err.code) {
                if ([1011, 1012, 1021].includes(err.code)) return res.status(HttpStatus.BAD_REQUEST).send(err)
                else if (err.code === 1401) return res.status(HttpStatus.UNAUTHORIZED).send(err)
                else if (err.code === 1429) return res.status(HttpStatus.TOO_MANY_REQUESTS).send(err)
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err)
            }
            return res.status(handlerError.code).send(handlerError.toJSON())
        }
    }

}

// 1011 -> 1021 = 400
// 1401 = 401
// 1429 = 429
// 1500 = 500

// * 1011 - Expired Token
// * 1012 - Invalid Token
// * 1021 - Invalid Refresh Token
// * 1401 - Invalid Client Credentials
// * 1429 - Too Many Requests
// * 1500 - Generic Error
