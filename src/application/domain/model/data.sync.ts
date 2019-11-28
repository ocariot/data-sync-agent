import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { LogSync } from './log.sync'
import { JsonUtils } from '../utils/json.utils'

export class DataSync implements IJSONSerializable, IJSONDeserializable<DataSync> {
    private _activities: number
    private _sleep: number
    private _weights: number
    private _logs: LogSync
    private _user_id?: string

    constructor() {
        this._activities = 0
        this._sleep = 0
        this._weights = 0
        this._logs = new LogSync()
    }

    get user_id(): string | undefined {
        return this._user_id
    }

    set user_id(value: string | undefined) {
        this._user_id = value
    }

    get activities(): number {
        return this._activities
    }

    set activities(value: number) {
        this._activities = value
    }

    get sleep(): number {
        return this._sleep
    }

    set sleep(value: number) {
        this._sleep = value
    }

    get weights(): number {
        return this._weights
    }

    set weights(value: number) {
        this._weights = value
    }

    get logs(): LogSync {
        return this._logs
    }

    set logs(value: LogSync) {
        this._logs = value
    }

    public fromJSON(json: any): DataSync {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.activities !== undefined) this.activities = json.activities
        if (json.sleep !== undefined) this.sleep = json.sleep
        if (json.weights !== undefined) this.weights = json.weights
        if (json.logs !== undefined) this.logs = new LogSync().fromJSON(json.logs)

        return this
    }

    public toJSON(): any {
        return {
            activities: this.activities,
            sleep: this.sleep,
            weights: this.weights,
            logs: this.logs ? this.logs.toJSON() : undefined
        }
    }
}
