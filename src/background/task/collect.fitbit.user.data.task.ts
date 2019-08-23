import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { Query } from '../../infrastructure/repository/query/query'
import { ILogger } from '../../utils/custom.logger'
import { IConnectionDB } from '../../infrastructure/port/connection.db.interface'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { IFitbitAuthDataRepository } from '../../application/port/fitbit.auth.data.repository.interface'
import { FitbitAuthData } from '../../application/domain/model/fitbit.auth.data'

@injectable()
export class CollectFitbitUserDataTask implements IBackgroundTask {
    private FITBIT_DATA_COLLECT_FREQUENCY: number = 14400000 // Four hours, in millis

    constructor(
        @inject(Identifier.MONGODB_CONNECTION) private readonly _mongodb: IConnectionDB,
        @inject(Identifier.FITBIT_AUTH_DATA_REPOSITORY) private readonly _fitbitAuthDataRepo: IFitbitAuthDataRepository,
        @inject(Identifier.LOGGER) /*private*/ readonly _logger: ILogger
    ) {
    }

    public async run(): Promise<void> {
        this._mongodb.eventConnection.on('connected', async () => {
            await this.getFitbitUsersData()
            setInterval(async () => {
                await this.getFitbitUsersData()
            }, this.FITBIT_DATA_COLLECT_FREQUENCY)
        })
    }

    private async getFitbitUsersData(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const usersData: Array<FitbitAuthData> = await this._fitbitAuthDataRepo.find(new Query())
            for await (const data of usersData) {
                this._fitbitAuthDataRepo.getFitbitUserData(data, 1)
                    .then(() => this._logger.info(`Data from ${data.user_id} successful synchronized!`))
                    .catch(err => this._logger.error(err.message))
            }
        })
    }

    public stop(): Promise<void> {
        return Promise.resolve()
    }
}
