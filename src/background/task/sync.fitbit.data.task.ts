import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { Query } from '../../infrastructure/repository/query/query'
import { UserAuthData } from '../../application/domain/model/user.auth.data'
import cron from 'node-cron'
import { IUserAuthDataService } from '../../application/port/user.auth.data.service.interface'
import { Default } from '../../utils/default'
import { DataSync } from '../../application/domain/model/data.sync'
import { Job } from 'bull'
import Bull = require('bull')

@injectable()
export class SyncFitbitDataTask implements IBackgroundTask {
    private schedule: any
    private fitbitSyncQueue: Bull.Queue<UserAuthData>
    private readonly queueOpts: Bull.JobOptions = {
        removeOnComplete: true, // If true, removes the job when it successfully
        removeOnFail: true // If true, removes the job when it fails after all attempts.
    }

    constructor(
        @inject(Identifier.USER_AUTH_DATA_SERVICE) private readonly _userAuthDataService: IUserAuthDataService,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
        this.fitbitSyncQueue = new Bull('fitbit-sync', process.env.REDIS_URI || Default.REDIS_URI)
        this.initListeners()
        this.schedule = cron.schedule(`${process.env.EXPRESSION_AUTO_SYNC || Default.EXPRESSION_AUTO_SYNC}`,
            () => this.externalDataSync())
    }

    public async run(): Promise<void> {
        this.schedule.start()
        // Process queue jobs
        this.fitbitSyncQueue
            .process(job => this._userAuthDataService.syncFitbitDataFromUser(job.data.user_id!))
            .catch(e => this._logger.error(`An error occurred processing queue for Fitbit synchronization. ${e.message}`))
    }

    private externalDataSync(): void {
        const query = new Query()
        query.filters = { 'fitbit.status': 'valid_token' }

        this._userAuthDataService
            .getAll(query)
            .then((usersData: Array<UserAuthData>) => {
                if (!usersData.length) {
                    this._logger.warn('There are no users with Fitbit access to perform synchronization...')
                    return
                }
                // Create jobs and add them to queue to process later
                usersData.forEach(item => this.fitbitSyncQueue.add(item, this.queueOpts))
            })
            .catch(err => {
                this._logger.error(`An error occurred while trying to retrieve data for Fitbit sync. ${err.message}`)
            })
    }

    private initListeners(): void {
        this.fitbitSyncQueue
            .on('completed', (job: Job, result: DataSync) => {
                this._logger.info(`Fitbit data synchronization for child ${result.user_id} is finished!`)
            })
            .on('failed', (job: Job, err: Error) => {
                this._logger.error(
                    `An error occurred while syncing Fitbit data from child ${job.data.user_id}. ${err.message}`
                )
            })
            .on('drained', () => {
                this._logger.info('Fitbit data synchronization queue completed!')
            })
    }

    public stop(): Promise<void> {
        this.fitbitSyncQueue.empty().then()
        this.schedule.destroy()
        return Promise.resolve()
    }
}
