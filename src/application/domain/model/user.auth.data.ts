import { Entity } from './entity'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { FitbitAuthData } from './fitbit.auth.data'

export class UserAuthData extends Entity implements IJSONSerializable, IJSONDeserializable<UserAuthData> {
    private _user_id?: string
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
        if (json.user_id !== undefined) this.user_id = json.user_id
        if (json.fitbit !== undefined) this.fitbit = new FitbitAuthData().fromJSON(json.fitbit)

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            user_id: this.user_id,
            fitbit: this.fitbit ? this.fitbit.toJSON() : undefined
        }
    }

}
