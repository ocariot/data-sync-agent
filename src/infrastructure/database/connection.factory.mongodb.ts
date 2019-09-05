import { injectable } from 'inversify'
import mongoose, { Connection, Mongoose } from 'mongoose'
import { IConnectionFactory, IDBOptions } from '../port/connection.factory.interface'

@injectable()
export class ConnectionFactoryMongoDB implements IConnectionFactory {
    private readonly options = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        bufferMaxEntries: 0,
        reconnectTries: Number.MAX_SAFE_INTEGER,
        reconnectInterval: 2000
    }

    /**
     * Create instance of MongoDb.
     *
     * @param uri This specification defines an URI scheme.
     * For more details see: {@link https://docs.mongodb.com/manual/reference/connection-string/}
     * @param options {IDBOptions} Connection setup Options.
     * @return Promise<Connection>
     */
    public createConnection(uri: string, options?: IDBOptions): Promise<Connection> {
        if (options && options.retries && options.retries > 0) this.options.reconnectTries = options.retries
        if (options && options.interval) this.options.reconnectInterval = options.interval

        return new Promise<Connection>((resolve, reject) => {
            mongoose.connect(uri, this.options)
                .then((result: Mongoose) => resolve(result.connection))
                .catch(err => reject(err))
        })
    }
}
