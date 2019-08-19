import { Entity } from './entity'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'

export class FitbitAuthData extends Entity implements IJSONSerializable, IJSONDeserializable<FitbitAuthData> {
    private _child_id?: string
    private _access_token?: string
    private _expires_in?: number
    private _refresh_token?: string
    private _scope?: string
    private _user_id?: string
    private _token_type?: string

    get child_id(): string | undefined {
        return this._child_id
    }

    set child_id(value: string | undefined) {
        this._child_id = value
    }

    get access_token(): string | undefined {
        return this._access_token
    }

    set access_token(value: string | undefined) {
        this._access_token = value
    }

    get expires_in(): number | undefined {
        return this._expires_in
    }

    set expires_in(value: number | undefined) {
        this._expires_in = value
    }

    get refresh_token(): string | undefined {
        return this._refresh_token
    }

    set refresh_token(value: string | undefined) {
        this._refresh_token = value
    }

    get scope(): string | undefined {
        return this._scope
    }

    set scope(value: string | undefined) {
        this._scope = value
    }

    get user_id(): string | undefined {
        return this._user_id
    }

    set user_id(value: string | undefined) {
        this._user_id = value
    }

    get token_type(): string | undefined {
        return this._token_type
    }

    set token_type(value: string | undefined) {
        this._token_type = value
    }

    constructor() {
        super()
    }

    public fromJSON(json: any): FitbitAuthData {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.id !== undefined) super.id = json.id
        if (json.child_id !== undefined) this.child_id = json.child_id
        if (json.access_token !== undefined) this.access_token = json.access_token
        if (json.expires_in !== undefined) this.expires_in = json.expires_in
        if (json.refresh_token !== undefined) this.refresh_token = json.refresh_token
        if (json.scope !== undefined) this.scope = json.scope
        if (json.user_id !== undefined) this.user_id = json.user_id
        if (json.token_type !== undefined) this.token_type = json.token_type

        return this
    }

    public toJSON(): any {
        return {
            child_id: this.child_id,
            access_token: this.access_token,
            expires_in: this.expires_in,
            refresh_token: this.refresh_token,
            scope: this.scope,
            user_id: this.user_id,
            token_type: this.token_type
        }
    }

}
