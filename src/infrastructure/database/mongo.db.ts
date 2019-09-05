import { Connection } from 'mongoose'
import { inject, injectable } from 'inversify'
import { IConnectionFactory, IDBOptions } from '../port/connection.factory.interface'
import { Identifier } from '../../di/identifiers'
import { IDatabase } from '../port/database.interface'
import { ILogger } from '../../utils/custom.logger'
import { EventEmitter } from 'events'

/**
 * Implementation of the interface that provides connection with MongoDb.
 * To implement the MongoDb abstraction the mongoose library was used.
 *
 * @see {@link https://mongoosejs.com/} for more details.
 * @implements {IDatabase}
 */
@injectable()
export class MongoDB implements IDatabase {
    private _connection?: Connection
    private readonly _eventConnection: EventEmitter

    constructor(
        @inject(Identifier.MONGODB_CONNECTION_FACTORY) private readonly _connectionFactory: IConnectionFactory,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
        this._eventConnection = new EventEmitter()
    }

    get connection(): Connection | undefined {
        return this._connection
    }

    get eventConnection(): EventEmitter {
        return this._eventConnection
    }

    /**
     * Once connected, the reconnection policy is managed by the MongoDb driver,
     * the values set in the environment variables or in the default file are
     * used for the total number of retries and intervals between them.
     *
     * In case MongoDb is initially not available for a first connection,
     * a new attempt will be made every 2 seconds. After the successful
     * connection, reconnection will be automatically managed by the MongoDb driver.
     *
     * @param uri This specification defines an URI scheme.
     * For more details see: {@link https://docs.mongodb.com/manual/reference/connection-string/}
     * @param options {IDBOptions} Connection setup Options.
     * @return {Promise<void>}
     */
    public async connect(uri: string, options?: IDBOptions): Promise<void> {
        const _this = this
        await this._connectionFactory.createConnection(uri, options)
            .then((connection: Connection) => {
                this._connection = connection
                this.connectionStatusListener(this._connection)
                this._eventConnection.emit('connected')
                this._logger.info('Connection established with MongoDb...')
            })
            .catch((err) => {
                this._connection = undefined
                this._eventConnection.emit('disconnected')
                this._logger.warn(`Error trying to connect for the first time with mongoDB: ${err.message}`)
                setTimeout(async () => {
                    _this.connect(uri, options).then()
                }, 2000)
            })
    }

    /**
     * Initializes connected and disconnected listeners.
     *
     * @param connection
     */
    private connectionStatusListener(connection: Connection | undefined): void {
        if (!connection) {
            this._connection = undefined
            this._eventConnection.emit('disconnected')
            return
        }

        connection.on('connected', () => {
            this._logger.warn('Reconnection established with MongoDb...')
            this._eventConnection.emit('connected')
        })

        connection.on('disconnected', () => {
            this._connection = undefined
            this._eventConnection.emit('disconnected')
            this._logger.warn('Connection to MongoDb was lost...')
        })
    }

    /**
     * Releases the resources.
     *
     * @return {Promise<void>}
     */
    public async dispose(): Promise<void> {
        if (this._connection) await this._connection.close()
        this._connection = undefined
    }
}
