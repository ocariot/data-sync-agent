import { Entity } from './entity'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { FitbitAuthData } from './fitbit.auth.data'
import moment from 'moment'

export class UserAuthData extends Entity implements IJSONSerializable, IJSONDeserializable<UserAuthData> {
    private _user_id?: string
    private _last_sync?: string
    private _fitbit?: FitbitAuthData

    constructor() {
        super()
    }

    get user_id(): string | undefined {
        return this._user_id
    }

    set user_id(value: string | undefined) {
        this._user_id = value
    }

    get last_sync(): string | undefined {
        return this._last_sync
    }

    set last_sync(value: string | undefined) {
        this._last_sync = value
    }

    get fitbit(): FitbitAuthData | undefined {
        return this._fitbit
    }

    set fitbit(value: FitbitAuthData | undefined) {
        this._fitbit = value
    }

    public fromJSON(json: any): UserAuthData {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.id !== undefined) super.id = json.id
        if (json.last_sync !== undefined) this.last_sync = moment(json.last_sync).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        if (json.fitbit !== undefined) this.fitbit = new FitbitAuthData().fromJSON(json.fitbit)

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            last_sync: this.last_sync,
            fitbit: this.fitbit ? this.fitbit.toJSON() : undefined
        }
    }

}
