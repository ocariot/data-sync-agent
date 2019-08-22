import { SleepPatternSummaryData } from './sleep.pattern.summary.data'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'

/**
 * The implementation of the summary entity of sleep pattern.
 *
 * @implements {IJSONSerializable, IJSONDeserializable<SleepPatternPhasesSummary>}
 */
export class SleepPatternStagesSummary implements IJSONSerializable, IJSONDeserializable<SleepPatternStagesSummary> {
    private _deep!: SleepPatternSummaryData
    private _light!: SleepPatternSummaryData
    private _rem!: SleepPatternSummaryData
    private _wake!: SleepPatternSummaryData

    constructor(deep?: SleepPatternSummaryData, light?: SleepPatternSummaryData, rem?: SleepPatternSummaryData,
                wake?: SleepPatternSummaryData) {
        if (deep) this.deep = deep
        if (light) this.light = light
        if (rem) this.rem = rem
        if (wake) this.wake = wake
    }

    get deep(): SleepPatternSummaryData {
        return this._deep
    }

    set deep(value: SleepPatternSummaryData) {
        this._deep = value
    }

    get light(): SleepPatternSummaryData {
        return this._light
    }

    set light(value: SleepPatternSummaryData) {
        this._light = value
    }

    get rem(): SleepPatternSummaryData {
        return this._rem
    }

    set rem(value: SleepPatternSummaryData) {
        this._rem = value
    }

    get wake(): SleepPatternSummaryData {
        return this._wake
    }

    set wake(value: SleepPatternSummaryData) {
        this._wake = value
    }

    public fromJSON(json: any): SleepPatternStagesSummary {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.deep !== undefined) this.deep = new SleepPatternSummaryData(json.deep.count, json.deep.duration)
        if (json.light !== undefined) this.light = new SleepPatternSummaryData(json.light.count, json.light.duration)
        if (json.rem !== undefined) this.rem = new SleepPatternSummaryData(json.rem.count, json.rem.duration)
        if (json.wake !== undefined) this.wake = new SleepPatternSummaryData(json.wake.count, json.wake.duration)

        return this
    }

    public toJSON(): any {
        return {
            deep: this.deep,
            light: this.light,
            rem: this.rem,
            wake: this.wake
        }
    }
}
