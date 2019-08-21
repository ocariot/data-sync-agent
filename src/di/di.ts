import 'reflect-metadata'
import { Container } from 'inversify'
import { HomeController } from '../ui/controllers/home.controller'
import { Identifier } from './identifiers'
import { ConnectionFactoryMongodb } from '../infrastructure/database/connection.factory.mongodb'
import { ConnectionMongodb } from '../infrastructure/database/connection.mongodb'
import { IConnectionDB } from '../infrastructure/port/connection.db.interface'
import { IConnectionFactory } from '../infrastructure/port/connection.factory.interface'
import { BackgroundService } from '../background/background.service'
import { App } from '../app'
import { CustomLogger, ILogger } from '../utils/custom.logger'
import { ConnectionFactoryRabbitMQ } from '../infrastructure/eventbus/rabbitmq/connection.factory.rabbitmq'
import { IConnectionEventBus } from '../infrastructure/port/connection.event.bus.interface'
import { EventBusRabbitMQ } from '../infrastructure/eventbus/rabbitmq/eventbus.rabbitmq'
import { ConnectionRabbitMQ } from '../infrastructure/eventbus/rabbitmq/connection.rabbitmq'
import { IEventBus } from '../infrastructure/port/event.bus.interface'
import { IntegrationEventRepoModel } from '../infrastructure/database/schema/integration.event.schema'
import { IntegrationEventRepository } from '../infrastructure/repository/integration.event.repository'
import { IIntegrationEventRepository } from '../application/port/integration.event.repository.interface'
import { UserFitbitAuthController } from '../ui/controllers/user.fitbit.auth.controller'
import { UserFitbitSyncController } from '../ui/controllers/user.fitbit.sync.controller'
import { FitbitAuthDataRepoModel } from '../infrastructure/database/schema/fitbit.auth.data.schema'
import { FitbitAuthData } from '../application/domain/model/fitbit.auth.data'
import { FitbitAuthDataEntity } from '../infrastructure/entity/fitbit.auth.data.entity'
import { FitbitAuthDataEntityMapper } from '../infrastructure/entity/mapper/fitbit.auth.data.entity.mapper'
import { IEntityMapper } from '../infrastructure/port/entity.mapper.interface'
import { FitbitAuthDataRepository } from '../infrastructure/repository/fitbit.auth.data.repository'
import { IFitbitAuthDataRepository } from '../application/port/fitbit.auth.data.repository.interface'
import { IFitbitAuthDataService } from '../application/port/fitbit.auth.data.service.interface'
import { FitbitAuthDataService } from '../application/service/fitbit.auth.data.service'
import { CallbackController } from '../ui/controllers/callback.controller'

class IoC {
    private readonly _container: Container

    /**
     * Creates an instance of Di.
     *
     * @private
     */
    constructor() {
        this._container = new Container()
        this.initDependencies()
    }

    /**
     * Get Container inversify.
     *
     * @returns {Container}
     */
    get container(): Container {
        return this._container
    }

    /**
     * Initializes injectable containers.
     *
     * @private
     * @return void
     */
    private initDependencies(): void {
        this._container.bind(Identifier.APP).to(App).inSingletonScope()

        // Controllers
        this._container.bind<HomeController>(Identifier.HOME_CONTROLLER).to(HomeController).inSingletonScope()
        this._container.bind<CallbackController>(Identifier.CALLBACK_CONTROLLER).to(CallbackController).inSingletonScope()
        this._container.bind<UserFitbitAuthController>(Identifier.USER_FITBIT_AUTH_CONTROLLER)
            .to(UserFitbitAuthController).inSingletonScope()
        this._container.bind<UserFitbitSyncController>(Identifier.USER_FITBIT_SYNC_CONTROLLER)
            .to(UserFitbitSyncController).inSingletonScope()

        // Services
        this.container.bind<IFitbitAuthDataService<FitbitAuthData>>(Identifier.FITBIT_AUTH_DATA_SERVICE)
            .to(FitbitAuthDataService).inSingletonScope()

        // Repositories
        this._container
            .bind<IIntegrationEventRepository>(Identifier.INTEGRATION_EVENT_REPOSITORY)
            .to(IntegrationEventRepository).inSingletonScope()
        this._container
            .bind<IFitbitAuthDataRepository>(Identifier.FITBIT_AUTH_DATA_REPOSITORY)
            .to(FitbitAuthDataRepository).inSingletonScope()

        // Models
        this._container.bind(Identifier.INTEGRATION_EVENT_REPO_MODEL).toConstantValue(IntegrationEventRepoModel)
        this._container.bind(Identifier.FITBIT_AUTH_DATA_REPO_MODEL).toConstantValue(FitbitAuthDataRepoModel)

        // Mappers
        this.container
            .bind<IEntityMapper<FitbitAuthData, FitbitAuthDataEntity>>(Identifier.FITBIT_AUTH_DATA_ENTITY_MAPPER)
            .to(FitbitAuthDataEntityMapper).inSingletonScope()

        // Background Services
        this._container
            .bind<IConnectionFactory>(Identifier.MONGODB_CONNECTION_FACTORY)
            .to(ConnectionFactoryMongodb).inSingletonScope()
        this._container
            .bind<IConnectionDB>(Identifier.MONGODB_CONNECTION)
            .to(ConnectionMongodb).inSingletonScope()
        this._container
            .bind<IConnectionFactory>(Identifier.RABBITMQ_CONNECTION_FACTORY)
            .to(ConnectionFactoryRabbitMQ).inSingletonScope()
        this._container
            .bind<IConnectionEventBus>(Identifier.RABBITMQ_CONNECTION)
            .to(ConnectionRabbitMQ)
        this._container
            .bind<IEventBus>(Identifier.RABBITMQ_EVENT_BUS)
            .to(EventBusRabbitMQ).inSingletonScope()
        this._container
            .bind(Identifier.BACKGROUND_SERVICE)
            .to(BackgroundService).inSingletonScope()

        // Tasks
        // Log
        this._container.bind<ILogger>(Identifier.LOGGER).to(CustomLogger).inSingletonScope()
    }
}

export const DIContainer = new IoC().container
