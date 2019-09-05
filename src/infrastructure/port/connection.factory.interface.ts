export interface IConnectionFactory {
    createConnection(uri: string, options?: IDBOptions | IEventBusOptions): Promise<any>
}

export interface IDBOptions {
    retries?: number
    interval?: number
}

export interface IEventBusOptions {
    rpcTimeout?: number
    receiveFromYourself?: boolean
    retries?: number
    interval?: number
    sslOptions?: ISSL
}

export interface ISSL {
    cert?: Buffer
    key?: Buffer
    ca?: Buffer[]
}
