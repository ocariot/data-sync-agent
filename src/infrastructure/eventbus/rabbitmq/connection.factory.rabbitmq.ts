import { injectable } from 'inversify'
import { IConnectionFactory, IEventBusOptions } from '../../port/connection.factory.interface'
import { IOcariotRabbitMQClient, OcariotRabbitMQClient } from '@ocariot/rabbitmq-client-node'

@injectable()
export class ConnectionFactoryRabbitMQ implements IConnectionFactory {
    private readonly options = {
        rpcTimeout: 5000,
        receiveFromYourself: false,
        retries: 0,
        interval: 2000
    }

    /**
     * Create instance of Class belonging to the @ocariot/rabbitmq-client-node library to connect to RabbitMQ.
     *
     * @param uri This specification defines an "amqp" URI scheme.
     * @param options {IEventBusOptions} Connection setup Options.
     * @return Promise<IOcariotRabbitMQClient>
     */
    public async createConnection(uri: string, options?: IEventBusOptions): Promise<IOcariotRabbitMQClient> {
        return Promise.resolve(
            new OcariotRabbitMQClient('data.sync.agent.app', uri, { ...this.options, ...options })
        )
    }
}
