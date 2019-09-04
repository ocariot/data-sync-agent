import { Entity } from './entity'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'

export class Resource extends Entity implements IJSONSerializable, IJSONDeserializable<Resource> {
    private _resource_id?: string
    private _date_sync?: string
    private _user_id?: string
    private _provider?: string

    constructor() {
        super()
    }

    get resource_id(): string | undefined {
        return this._resource_id
    }

    set resource_id(value: string | undefined) {
        this._resource_id = value
    }

    get date_sync(): string | undefined {
        return this._date_sync
    }

    set date_sync(value: string | undefined) {
        this._date_sync = value
    }

    get user_id(): string | undefined {
        return this._user_id
    }

    set user_id(value: string | undefined) {
        this._user_id = value
    }

    get provider(): string | undefined {
        return this._provider
    }

    set provider(value: string | undefined) {
        this._provider = value
    }

    public fromJSON(json: any): Resource {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.resource_id !== undefined) this.resource_id = json.resource_id
        if (json.user_id !== undefined) this.user_id = json.user_id
        if (json.date_sync !== undefined) this.date_sync = json.date_sync
        if (json.provider !== undefined) this.provider = json.provider

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            resource_id: this.resource_id,
            user_id: this.user_id,
            date_sync: this.date_sync,
            provider: this.provider
        }
    }

}
