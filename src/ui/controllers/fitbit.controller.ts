import { controller, httpGet, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import HttpStatus from 'http-status-codes'

@controller('/v1/fitbit')
export class FitbitController {

    @httpGet('/')
    public async getFitbitClient(@request() req: Request, @response() res: Response): Promise<Response> {
        return (process.env.FITBIT_CLIENT_ID && process.env.FITBIT_CLIENT_SECRET) ?
            res.status(HttpStatus.OK).send({
                client_id: `${process.env.FITBIT_CLIENT_ID}`,
                client_secret: `${process.env.FITBIT_CLIENT_SECRET}`
            }) :
            res.status(HttpStatus.NOT_FOUND).send({
                code: 404,
                message: 'Fitbit client id and secret key not found!'
            })
    }
}
