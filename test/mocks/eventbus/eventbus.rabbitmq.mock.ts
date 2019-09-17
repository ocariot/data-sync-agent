import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { IDisposable } from '../../../src/infrastructure/port/disposable.interface'
import { IIntegrationEventHandler } from '../../../src/application/integration-event/handler/integration.event.handler.interface'
import { IntegrationEvent } from '../../../src/application/integration-event/event/integration.event'
import { IEventBusOptions } from '../../../src/infrastructure/port/connection.factory.interface'
import qs from 'query-strings-parser'
import { DefaultEntityMock } from '../models/default.entity.mock'

export class EventBusRabbitMQMock implements IEventBus, IDisposable {
    private readonly _bus!: any

    constructor() {
        this._bus = {
            getChildren: (query: string): Promise<any> => {
                const filters: any = qs.parser(query).filters
                if (filters._id === 'error') return Promise.reject({ message: 'An error occurs!' })
                return Promise.resolve(filters._id && filters._id === DefaultEntityMock.USER_IDS.child_id ?
                    [DefaultEntityMock.CHILD] : [])
            }
        }
    }

    get bus(): any {
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
