import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'

/**
 * The implementation of the data set entity present in the sleep pattern.
 *
 * @implements {IJSONSerializable, IJSONDeserializable<SleepPatternDataSet>}
 */
export class SleepPatternDataSet implements IJSONSerializable, IJSONDeserializable<SleepPatternDataSet> {
    private _start_time!: string // Date and time of the start of the pattern according to the UTC.
    private _name!: PhasesPatternType | StagesPatternType // Sleep pattern name (asleep, restless or awake) or (deep, light,
                                                          // rem or wake).
    private _duration!: number // Total in milliseconds of the time spent on the pattern.

    get start_time(): string {
        return this._start_time
    }

    set start_time(value: string) {
        this._start_time = value
    }

    get name(): PhasesPatternType | StagesPatternType {
        return this._name
    }

    set name(value: PhasesPatternType | StagesPatternType) {
        this._name = value
    }

    get duration(): number {
        return this._duration
    }

    set duration(value: number) {
        this._duration = value
    }

    public fromJSON(json: any): SleepPatternDataSet {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.start_time !== undefined) this.start_time = json.start_time
        if (json.name !== undefined) this.name = json.name
        if (json.duration !== undefined) this.duration = json.duration

        return this
    }

    public toJSON(): any {
        return {
            start_time: this.start_time ? this.start_time : this.start_time,
            name: this.name === 'wake' ? 'awake' : this.name,
            duration: this.duration
        }
    }
}

/**
 * Name of traceable sleep stages.
 */
export enum PhasesPatternType {
    ASLEEP = 'asleep',
    RESTLESS = 'restless',
    AWAKE = 'awake'
}

/**
 * Name of traceable sleep stages.
 */
export enum StagesPatternType {
    DEEP = 'deep',
    LIGHT = 'light',
    REM = 'rem',
    WAKE = 'wake'
}
