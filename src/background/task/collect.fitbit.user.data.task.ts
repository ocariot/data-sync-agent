import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { IConnectionDB } from '../../infrastructure/port/connection.db.interface'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { IFitbitDataRepository } from '../../application/port/fitbit.auth.data.repository.interface'
import { IUserAuthDataRepository } from '../../application/port/user.auth.data.repository.interface'
import { Query } from '../../infrastructure/repository/query/query'
import { UserAuthData } from '../../application/domain/model/user.auth.data'
import cron from 'node-cron'
import moment from 'moment'

@injectable()
export class CollectFitbitUserDataTask implements IBackgroundTask {
    private schedule: any

    constructor(
        @inject(Identifier.MONGODB_CONNECTION) private readonly _mongodb: IConnectionDB,
        @inject(Identifier.FITBIT_DATA_REPOSITORY) private readonly _fitbitAuthDataRepo: IFitbitDataRepository,
        @inject(Identifier.USER_AUTH_DATA_REPOSITORY) private readonly _userAuthDataRepo: IUserAuthDataRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
        this.createSchedule(`${process.env.EXPRESSION_AUTO_SYNC}`)
    }

    public async run(): Promise<void> {
        this._mongodb.eventConnection.on('connected', async () => {
            this.schedule.start()
        })
    }

    public async createSchedule(expression: string): Promise<void> {
        this.schedule = cron.schedule(expression, async () => {
            console.log('running a task every minute -', moment().format('HH:mm:ss'))
            this.getFitbitUsersData()
        })
    }

    private async getFitbitUsersData(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const usersData: Array<UserAuthData> = await this._userAuthDataRepo.find(new Query())
            for await (const data of usersData) {
                this._fitbitAuthDataRepo.syncFitbitUserData(data.fitbit!, data.fitbit!.last_sync!, 1, data.user_id!)
                    .then(() => this._logger.info(`Data from ${data.user_id} successful synchronized!`))
                    .catch(err => this._logger.error(err.message))
            }
        })
    }

    public stop(): Promise<void> {
        this.schedule.stop()
        return Promise.resolve()
    }
}
