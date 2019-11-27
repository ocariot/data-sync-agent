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
import Bull, { Job } from 'bull'
import url, { UrlWithStringQuery } from 'url'
import net from 'net'

@injectable()
export class SyncFitbitDataTask implements IBackgroundTask {
    private schedule: any
    private syncQueue?: Bull.Queue<UserAuthData>
    private redisURI: UrlWithStringQuery = url.parse(process.env.REDIS_URI || Default.REDIS_URI)

    constructor(
        @inject(Identifier.USER_AUTH_DATA_SERVICE) private readonly _userAuthDataService: IUserAuthDataService,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
        this.schedule = cron.schedule(`${process.env.EXPRESSION_AUTO_SYNC || Default.EXPRESSION_AUTO_SYNC}`,
            () => this.fitbitDataSync(), {
                scheduled: false
            })
    }

    public async run(): Promise<void> {
        try {
            if (this.syncQueue) {
                await this.syncQueue.empty()
                this.syncQueue = undefined
                this.schedule.destroy()
            }
            // It is necessary wait until Redis is available to initialize the queue.
            await this.waitRedis()

            // Initialize Redis and register job processor
            this.syncQueue = this.initRedis()
            this.initRedisListeners()
            this.syncQueue!
                .process(job => this._userAuthDataService.syncFitbitDataFromUser(job.data.user_id!))
                .catch(e => this._logger.error(`An error occurred processing queue for Fitbit sync. ${e.message}`))

            // Initialize crontab
            this.schedule.start()

            this._logger.debug('Fitbit data sync task started successfully!')
        } catch (e) {
            this._logger.error(`An error occurred initializing the Fitbit data sync task. ${e.message}`)
        }
    }

    public stop(): Promise<void> {
        if (this.syncQueue) this.syncQueue!.empty().then()
        this.schedule.destroy()
        return Promise.resolve()
    }

    /**
     * Function to block flow until Redis instance is available.
     */
    private waitRedis(): Promise<void> {
        return new Promise<void>(async (resolve) => {
            const redisCheck = () => {
                setTimeout(() => {
                    const socket = new net.Socket()
                    const onError = () => {
                        this._logger.warn(`Waiting for instance of Redis (${this.redisURI.host}) to become available`)
                        socket.destroy()
                        redisCheck()
                    }
                    socket.setTimeout(500)
                    socket.once('error', onError)
                    socket.once('timeout', onError)
                    socket.connect(Number(this.redisURI.port!), this.redisURI.hostname!, () => {
                        socket.end()
                        return resolve()
                    })
                }, 2000)
            }
            redisCheck()
        })
    }

    /**
     * Initialize Redis configurations.
     */
    private initRedis(): Bull.Queue {
        return new Bull('fitbit-sync', {
            redis: {
                port: Number(this.redisURI.port!),
                host: this.redisURI.hostname!,
                maxRetriesPerRequest: null,
                enableReadyCheck: false
            },
            defaultJobOptions: {
                removeOnComplete: true, // If true, removes the job when it successfully
                removeOnFail: true // If true, removes the job when it fails after all attempts.
            }
        })
    }

    /**
     * Initialize Redis events
     */
    private initRedisListeners(): void {
        if (!this.syncQueue) return

        this.syncQueue
            .on('completed', (job: Job, result: DataSync) => {
                this._logger.debug(`Fitbit data sync job for child ${result.user_id} has been executed!`)
            })
            .on('failed', (job: Job, err: Error) => {
                this._logger.error(
                    `An error occurred while syncing Fitbit data from child ${job.data.user_id}. ${err.message}`
                )
            })
            .on('drained', () => {
                this._logger.debug('All jobs in the Fitbit data sync queue have been executed!')
            })
    }

    /**
     * Sync routine for external data like Fitbit.
     */
    private fitbitDataSync(): void {
        const query = new Query()
        query.filters = { 'fitbit.status': 'valid_token' }

        this._userAuthDataService
            .getAll(query)
            .then(async (usersData: Array<UserAuthData>) => {
                if (!usersData.length) {
                    this._logger.warn('There are no users with Fitbit access to perform synchronization...')
                    return
                }
                // Create jobs and add them to queue to process later
                for (const item of usersData) {
                    await this.syncQueue!.add(item)
                }
            })
            .catch(err => {
                this._logger.error(`An error occurred while trying to retrieve data for Fitbit sync. ${err.message}`)
            })
    }
}
