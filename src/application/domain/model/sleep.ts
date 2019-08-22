import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { Activity } from './activity'
import { SleepPattern } from './sleep.pattern'

/**
 * Implementation of the sleep entity.
 *
 * @extends {Activity}
 * @implements { IJSONSerializable, IJSONDeserializable<Sleep>
 */
export class Sleep extends Activity implements IJSONSerializable, IJSONDeserializable<Sleep> {
    private _pattern?: SleepPattern // Sleep Pattern tracking.
    private _type?: SleepType // Sleep Pattern type

    constructor() {
        super()
    }

    get pattern(): SleepPattern | undefined {
        return this._pattern
    }

    set pattern(value: SleepPattern | undefined) {
        this._pattern = value
    }

    get type(): SleepType | undefined {
        return this._type
    }

    set type(value: SleepType | undefined) {
        this._type = value
    }

    public fromJSON(json: any): Sleep {
        if (!json) return this
        super.fromJSON(json)

        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.pattern !== undefined) this.pattern = new SleepPattern().fromJSON(json.pattern)
        if (json.type !== undefined) this.type = json.type

        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{
                pattern: this.pattern ? this.pattern.toJSON() : this.pattern,
                type: this.type
            }
        }
    }
}

/**
 * Names of traceable sleep types.
 */
export enum SleepType {
    CLASSIC = 'classic',
    STAGES = 'stages'
}
