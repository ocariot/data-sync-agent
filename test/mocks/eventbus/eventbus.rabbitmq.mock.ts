import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { IDisposable } from '../../../src/infrastructure/port/disposable.interface'
import { IIntegrationEventHandler } from '../../../src/application/integration-event/handler/integration.event.handler.interface'
import { IntegrationEvent } from '../../../src/application/integration-event/event/integration.event'
import { IEventBusOptions } from '../../../src/infrastructure/port/connection.factory.interface'
import { IOcariotRabbitMQClient } from '@ocariot/rabbitmq-client-node'

export class EventBusRabbitMQMock implements IEventBus, IDisposable {
    private _bus!: IOcariotRabbitMQClient

    get bus(): IOcariotRabbitMQClient {
        return this._bus
    }

    public dispose(): Promise<void> {
        return Promise.resolve()
    }

    public subscribe(
        event: IntegrationEvent<any>,
        handler: IIntegrationEventHandler<IntegrationEvent<any>>,
        routingKey: string): Promise<boolean> {
        return Promise.resolve(true)
    }

    public initialize(uri: string, options?: IEventBusOptions): Promise<void> {
        return Promise.resolve()
    }

}
