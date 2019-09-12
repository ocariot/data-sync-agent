import { IJSONSerializable } from '../utils/json.serializable.interface'

/**
 * The implementation of the entity summary data of sleep pattern.
 *
 * @implements {IJSONSerializable, IJSONDeserializable<SleepPatternSummaryData>}
 */
export class SleepPatternSummaryData implements IJSONSerializable{
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

    public toJSON(): any {
        return {
            count: this.count,
            duration: this.duration
        }
    }
}
