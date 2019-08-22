/**
 * Constants used in dependence injection.
 *
 * @abstract
 */
export abstract class Identifier {
    public static readonly APP: any = Symbol.for('App')

    // Controllers
    public static readonly HOME_CONTROLLER: any = Symbol.for('HomeController')
    public static readonly CALLBACK_CONTROLLER: any = Symbol.for('CallbackController')
    public static readonly USER_FITBIT_AUTH_CONTROLLER: any = Symbol.for('UserFitbitAuthController')
    public static readonly USER_FITBIT_SYNC_CONTROLLER: any = Symbol.for('UserFitbitSyncController')

    // Services
    public static readonly FITBIT_AUTH_DATA_SERVICE: any = Symbol.for('FitbitAuthDataService')

    // Repositories
    public static readonly INTEGRATION_EVENT_REPOSITORY: any = Symbol.for('IntegrationEventRepository')
    public static readonly FITBIT_AUTH_DATA_REPOSITORY: any = Symbol.for('FitbitAuthDataRepository')

    // Models
    public static readonly INTEGRATION_EVENT_REPO_MODEL: any = Symbol.for('IntegrationEventRepoModel')
    public static readonly OAUTH_DATA_REPO_MODEL: any = Symbol.for('OAuthDataRepoModel')

    // Mappers
    public static readonly FITBIT_AUTH_DATA_ENTITY_MAPPER: any = Symbol.for('FitbitAuthDataEntityMapper')
    // Background Services
    public static readonly MONGODB_CONNECTION_FACTORY: any = Symbol.for('ConnectionFactoryMongodb')
    public static readonly MONGODB_CONNECTION: any = Symbol.for('ConnectionMongodb')
    public static readonly RABBITMQ_CONNECTION_FACTORY: any = Symbol.for('ConnectionFactoryRabbitMQ')
    public static readonly RABBITMQ_CONNECTION: any = Symbol.for('ConnectionRabbitMQ')
    public static readonly RABBITMQ_EVENT_BUS: any = Symbol.for('EventBusRabbitMQ')
    public static readonly BACKGROUND_SERVICE: any = Symbol.for('BackgroundService')

    // Tasks
    public static readonly PUBLISH_EVENT_BUS_TASK: any = Symbol.for('PublishEventBusTask')
    public static readonly COLLECT_FITBIT_USER_DATA_TASK: any = Symbol.for('CollectFitbitUserDataTask')

    // Log
    public static readonly LOGGER: any = Symbol.for('CustomLogger')
}
