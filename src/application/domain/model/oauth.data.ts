import { Entity } from './entity'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'

export class OauthData extends Entity implements IJSONSerializable, IJSONDeserializable<OauthData> {
    private _type?: string
    private _access_token?: string
    private _expires_in?: number
    private _refresh_token?: string
    private _scope?: string
    private _token_type?: string
    private _last_sync?: string

    get type(): string | undefined {
        return this._type
    }

    set type(value: string | undefined) {
        this._type = value
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

    get token_type(): string | undefined {
        return this._token_type
    }

    set token_type(value: string | undefined) {
        this._token_type = value
    }

    get last_sync(): string | undefined {
        return this._last_sync
    }

    set last_sync(value: string | undefined) {
        this._last_sync = value
    }

    public fromJSON(json: any): OauthData {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.id !== undefined) super.id = json.id
        if (json.type !== undefined) this.type = json.type
        if (json.last_sync !== undefined) this.last_sync = json.last_sync
        if (json.access_token !== undefined) this.access_token = json.access_token
        if (json.expires_in !== undefined) this.expires_in = json.expires_in
        if (json.refresh_token !== undefined) this.refresh_token = json.refresh_token
        if (json.scope !== undefined) this.scope = json.scope
        if (json.token_type !== undefined) this.token_type = json.token_type

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            type: this.type,
            last_sync: this.last_sync,
            access_token: this.access_token,
            expires_in: this.expires_in,
            refresh_token: this.refresh_token,
            scope: this.scope,
            token_type: this.token_type
        }
    }

}
