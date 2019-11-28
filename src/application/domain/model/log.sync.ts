import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'

export class LogSync implements IJSONSerializable, IJSONDeserializable<LogSync> {
    private _steps: number
    private _calories: number
    private _active_minutes: number
    private _lightly_active_minutes: number
    private _sedentary_minutes: number

    constructor() {
        this._steps = 0
        this._calories = 0
        this._active_minutes = 0
        this._lightly_active_minutes = 0
        this._sedentary_minutes = 0
    }

    get steps(): number {
        return this._steps
    }

    set steps(value: number) {
        this._steps = value
    }

    get calories(): number {
        return this._calories
    }

    set calories(value: number) {
        this._calories = value
    }

    get active_minutes(): number {
        return this._active_minutes
    }

    set active_minutes(value: number) {
        this._active_minutes = value
    }

    get lightly_active_minutes(): number {
        return this._lightly_active_minutes
    }

    set lightly_active_minutes(value: number) {
        this._lightly_active_minutes = value
    }

    get sedentary_minutes(): number {
        return this._sedentary_minutes
    }

    set sedentary_minutes(value: number) {
        this._sedentary_minutes = value
    }

    public fromJSON(json: any): LogSync {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.steps !== undefined) this.steps = json.steps
        if (json.calories !== undefined) this.calories = json.calories
        if (json.active_minutes !== undefined) this.active_minutes = json.active_minutes
        if (json.lightly_active_minutes !== undefined) this.lightly_active_minutes = json.lightly_active_minutes
        if (json.sedentary_minutes !== undefined) this.sedentary_minutes = json.sedentary_minutes

        return this
    }

    public toJSON(): any {
        return {
            steps: this.steps,
            calories: this.calories,
            active_minutes: this.active_minutes,
            lightly_active_minutes: this.lightly_active_minutes,
            sedentary_minutes: this.sedentary_minutes
        }
    }
}
