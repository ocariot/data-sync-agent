import { IDisposable } from './disposable.interface'
import { EventEmitter } from 'events'
import { IDBOptions } from './connection.factory.interface'

export interface IDatabase extends IDisposable {
    eventConnection: EventEmitter

    connect(uri: string, options?: IDBOptions): Promise<void>
}
