import HttpStatus from 'http-status-codes'
import { controller, httpPost, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { ApiExceptionManager } from '../exception/api.exception.manager'

/**
 * Controller that implements Children Fitbit Sync feature operations.
 * @remarks
 * To define paths, we use library inversify-express-utils.
 *
 * @see {@link https://github.com/inversify/inversify-express-utils} for further information.
 */
@controller('/v1/children/:child_id/fitbit/sync')
export class ChildrenFitbitSyncController {
    /**
     * Request the data sync from child.
     *
     * @returns Promise<Response>
     */
    @httpPost('/')
    public async requestDataSync(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code).send(handlerError.toJson())
        }
    }
}
