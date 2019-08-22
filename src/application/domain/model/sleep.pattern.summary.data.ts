import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'

/**
 * The implementation of the entity summary data of sleep pattern.
 *
 * @implements {IJSONSerializable, IJSONDeserializable<SleepPatternSummaryData>}
 */
export class SleepPatternSummaryData implements IJSONSerializable, IJSONDeserializable<SleepPatternSummaryData> {
    private _count: number
    private _duration: number // in milliseconds

    constructor(count: number, duration: number) {
        this._count = count
        this._duration = duration
    }

    get count(): number {
        return this._count
    }

    set count(value: number) {
        this._count = value
    }

    get duration(): number {
        return this._duration
    }

    set duration(value: number) {
        this._duration = value
    }

    public fromJSON(json: any): SleepPatternSummaryData {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.count !== undefined) this.count = json.count
        if (json.duration !== undefined) this.duration = json.duration

        return this
    }

    public toJSON(): any {
        return {
            count: this.count,
            duration: this.duration
        }
    }
}
