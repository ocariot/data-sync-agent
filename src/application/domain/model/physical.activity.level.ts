import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'

/**
 * Entity implementation of the physicalactivity levels.
 *
 * @implements {IJSONSerializable, IJSONDeserializable<PhysicalActivityLevel>}
 */
export class PhysicalActivityLevel implements IJSONSerializable, IJSONDeserializable<PhysicalActivityLevel> {
    private _name!: ActivityLevelType // Name of physicalactivity level (sedentary, light, fair or very).
    private _duration!: number // Total time spent in milliseconds on the level.

    constructor(name?: ActivityLevelType, duration?: number) {
        if (name) this.name = name
        if (duration) this.duration = duration
    }

    get name(): ActivityLevelType {
        return this._name
    }

    set name(value: ActivityLevelType) {
        this._name = value
    }

    get duration(): number {
        return this._duration
    }

    set duration(value: number) {
        this._duration = value
    }

    public fromJSON(json: any): PhysicalActivityLevel {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.name !== undefined) this.name = json.name
        if (json.duration !== undefined) this.duration = json.duration

        return this
    }

    public toJSON(): any {
        return {
            name: this.name,
            duration: this.duration
        }
    }
}

/**
 * Names of traceable physicalactivity levels.
 */
export enum ActivityLevelType {
    SEDENTARY = 'sedentary',
    LIGHTLY = 'lightly',
    FAIRLY = 'fairly',
    VERY = 'very'
}
