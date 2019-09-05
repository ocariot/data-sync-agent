import { IEventBusOptions } from './connection.factory.interface'
import { IOcariotRabbitMQClient } from '@ocariot/rabbitmq-client-node/lib'
import { IDisposable } from './disposable.interface'

export interface IEventBus extends IDisposable {
    bus: IOcariotRabbitMQClient

    initialize(uri: string, options?: IEventBusOptions): Promise<void>
}
