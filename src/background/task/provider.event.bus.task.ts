import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { ILogger } from '../../utils/custom.logger'

@injectable()
export class ProviderEventBusTask implements IBackgroundTask {
    constructor(
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public run(): void {
        this.initializeProviders()
    }

    public stop(): Promise<void> {
        return this._eventBus.dispose()
    }

    /**
     * Provide resources for queries.
     * Most queries support the query string pattern defined in the REST API.
     */
    private initializeProviders(): void {
        this._logger.info('There is no resource to provide.')
        // Providing physical activity resource.
        // this._eventBus.bus
        //     .providePhysicalActivities(async (query) => {
        //         const _query: IQuery = new Query().fromJSON({ ...qs.parser(query) })
        //         const result: Array<PhysicalActivity> = await this._activityRepository.find(_query)
        //         return result.map(item => item.toJSON())
        //     })
        //     .then(() => this._logger.info('PhysicalActivity resource provided successfully!'))
        //     .catch((err) => this._logger.error(`Error trying to provide PhysicalActivity resource: ${err.message}`))

        // TODO Register all resources here
    }
}
