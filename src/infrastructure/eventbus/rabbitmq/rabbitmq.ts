import { inject, injectable } from 'inversify'
import { IEventBus } from '../../port/eventbus.interface'
import { Identifier } from '../../../di/identifiers'
import { IConnectionFactory, IEventBusOptions } from '../../port/connection.factory.interface'
import { IOcariotRabbitMQClient } from '@ocariot/rabbitmq-client-node'

@injectable()
export class RabbitMQ implements IEventBus {
    private _bus!: IOcariotRabbitMQClient

    constructor(
        @inject(Identifier.RABBITMQ_CONNECTION_FACTORY) private connectionFactory: IConnectionFactory
    ) {
    }

    get bus(): IOcariotRabbitMQClient {
        return this._bus
    }

    public async initialize(uri: string, options?: IEventBusOptions): Promise<void> {
        this._bus = await this.connectionFactory
            .createConnection(uri, options)
        return Promise.resolve()
    }

    public dispose(): Promise<void> {
        if (this.bus) return this.bus.close()
        return Promise.resolve()
    }
}
