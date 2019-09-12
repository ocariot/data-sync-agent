import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { Log } from './log'

/**
 * Entity implementation of the child logs.
 *
 * @implements {IJSONSerializable, IJSONDeserializable<Log>}
 */
export class UserLog implements IJSONSerializable, IJSONDeserializable<UserLog> {
    private _steps!: Array<Log> // Logs of steps of a child
    private _calories!: Array<Log> // Logs of calories of a child
    private _active_minutes!: Array<Log> // Logs of active minutes of a child
    private _lightly_active_minutes!: Array<Log> // Logs of lightly active minutes of a child
    private _sedentary_minutes!: Array<Log> // Logs of sedentary minutes of a child

    get steps(): Array<Log> {
        return this._steps
    }

    set steps(value: Array<Log>) {
        this._steps = value
    }

    get calories(): Array<Log> {
        return this._calories
    }

    set calories(value: Array<Log>) {
        this._calories = value
    }

    get active_minutes(): Array<Log> {
        return this._active_minutes
    }

    set active_minutes(value: Array<Log>) {
        this._active_minutes = value
    }

    get lightly_active_minutes(): Array<Log> {
        return this._lightly_active_minutes
    }

    set lightly_active_minutes(value: Array<Log>) {
        this._lightly_active_minutes = value
    }

    get sedentary_minutes(): Array<Log> {
        return this._sedentary_minutes
    }

    set sedentary_minutes(value: Array<Log>) {
        this._sedentary_minutes = value
    }

    public fromJSON(json: any): UserLog {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.steps !== undefined && json.steps instanceof Array) {
            this.steps = json.steps.map(steps => new Log().fromJSON(steps))
        }

        if (json.calories !== undefined && json.calories instanceof Array) {
            this.calories = json.calories.map(calories => new Log().fromJSON(calories))
        }

        if (json.active_minutes !== undefined && json.active_minutes instanceof Array) {
            this.active_minutes = json.active_minutes.map(activeMinutes => new Log().fromJSON(activeMinutes))
        }

        if (json.lightly_active_minutes !== undefined && json.lightly_active_minutes instanceof Array) {
            this.lightly_active_minutes =
                json.lightly_active_minutes.map(lightlyActiveMinutes => new Log().fromJSON(lightlyActiveMinutes))
        }

        if (json.sedentary_minutes !== undefined && json.sedentary_minutes instanceof Array) {
            this.sedentary_minutes = json.sedentary_minutes.map(sedentaryMinutes => new Log().fromJSON(sedentaryMinutes))
        }

        return this
    }

    public toJSON(): any {
        return {
            steps: this.steps ? this.steps.map(item => item.toJSON()) : this.steps,
            calories: this.calories ? this.calories.map(item => item.toJSON()) : this.calories,
            active_minutes: this.active_minutes ? this.active_minutes.map(item => item.toJSON()) : this.active_minutes,
            lightly_active_minutes:
                this.lightly_active_minutes ? this.lightly_active_minutes.map(item => item.toJSON()) :
                    this.lightly_active_minutes,
            sedentary_minutes:
                this.sedentary_minutes ? this.sedentary_minutes.map(item => item.toJSON()) : this.sedentary_minutes
        }
    }

    public toJSONList(): Array<any> {
        return [
            ...this.steps ? this.steps.map(item => item.toJSON()) : [],
            ...this.calories ? this.calories.map(item => item.toJSON()) : [],
            ...this.active_minutes ? this.active_minutes.map(item => item.toJSON()) : [],
            ...this.lightly_active_minutes ? this.lightly_active_minutes.map(item => item.toJSON()) : [],
            ...this.sedentary_minutes ? this.sedentary_minutes.map(item => item.toJSON()) : []
        ]
    }
}
