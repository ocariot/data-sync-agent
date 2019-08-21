import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { OauthData } from './oauth.data'
import { JsonUtils } from '../utils/json.utils'

export class FitbitAuthData extends OauthData implements IJSONSerializable, IJSONDeserializable<FitbitAuthData> {
    private _user_id?: string

    get user_id(): string | undefined {
        return this._user_id
    }

    set user_id(value: string | undefined) {
        this._user_id = value
    }

    constructor() {
        super()
        super.type = 'fitbit'
    }

    public fromJSON(json: any): FitbitAuthData {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        super.fromJSON(json)
        if (json.user_id !== undefined) this.user_id = json.user_id
        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            user_id: this.user_id
        }
    }
}
