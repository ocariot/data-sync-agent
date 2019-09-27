import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { Query } from '../../infrastructure/repository/query/query'
import { UserAuthData } from '../../application/domain/model/user.auth.data'
import cron from 'node-cron'
import { IUserAuthDataService } from '../../application/port/user.auth.data.service.interface'

@injectable()
export class CollectFitbitUserDataTask implements IBackgroundTask {
    private schedule: any

    constructor(
        @inject(Identifier.USER_AUTH_DATA_SERVICE) private readonly _userAuthDataService: IUserAuthDataService,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
        this.schedule = cron.schedule(`${process.env.EXPRESSION_AUTO_SYNC}`, () => this.getFitbitUsersData())
    }

    public async run(): Promise<void> {
        this.schedule.start()
    }

    private getFitbitUsersData(): void {
        const query = new Query()
        query.filters = { 'fitbit.status': 'valid_token' }

        this._userAuthDataService
            .getAll(query)
            .then(async (usersData: Array<UserAuthData>) => {
                usersData.forEach(item => {
                    this._userAuthDataService
                        .syncFitbitDataFromUser(item.user_id!)
                        .then(() => this._logger.info(`Fitbit sync task for child ${item.user_id} finished!`))
                        .catch(err => {
                            this._logger.error(`Error at sync fitbit data task from ${item.user_id}: ${err.message}`)
                        })
                })
            })
            .catch(err => {
                this._logger.error(`An error occurred while performing Fitbit sync. ${err.message}`)
            })
    }

    public stop(): Promise<void> {
        this.schedule.destroy()
        return Promise.resolve()
    }
}
