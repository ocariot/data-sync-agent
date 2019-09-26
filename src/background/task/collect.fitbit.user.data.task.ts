import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { IFitbitDataRepository } from '../../application/port/fitbit.auth.data.repository.interface'
import { IUserAuthDataRepository } from '../../application/port/user.auth.data.repository.interface'
import { Query } from '../../infrastructure/repository/query/query'
import { UserAuthData } from '../../application/domain/model/user.auth.data'
import cron from 'node-cron'

@injectable()
export class CollectFitbitUserDataTask implements IBackgroundTask {
    private schedule: any

    constructor(
        @inject(Identifier.FITBIT_DATA_REPOSITORY) private readonly _fitbitAuthDataRepo: IFitbitDataRepository,
        @inject(Identifier.USER_AUTH_DATA_REPOSITORY) private readonly _userAuthDataRepo: IUserAuthDataRepository,
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

        this._userAuthDataRepo
            .find(query)
            .then(async (usersData: Array<UserAuthData>) => {
                usersData.forEach(item => {
                    this._fitbitAuthDataRepo
                        .syncFitbitUserData(item.fitbit!, item.fitbit!.last_sync!, 1, item.user_id!)
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
