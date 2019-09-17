import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import moment from 'moment'

/**
 * Entity implementation of the individual log of the PhysicalActivity.
 *
 * @implements {IJSONSerializable, IJSONDeserializable<Log>}
 */
export class Log implements IJSONSerializable, IJSONDeserializable<Log> {
    private _date!: string // Date of the log according to the format yyyy-MM-dd.
    private _value!: number // Log value.
    private _type!: string // Log type
    private _child_id!: string // Child ID

    get date(): string {
        return this._date
    }

    set date(value: string) {
        this._date = value
    }

    get value(): number {
        return this._value
    }

    set value(value: number) {
        this._value = value
    }

    get type(): string {
        return this._type
    }

    set type(value: string) {
        this._type = value
    }

    get child_id(): string {
        return this._child_id
    }

    set child_id(value: string) {
        this._child_id = value
    }

    public fromJSON(json: any): Log {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.type !== undefined) this.type = json.type
        if (json.date !== undefined) this.date = json.date
        if (json.value !== undefined) this.value = json.value
        if (json.child_id !== undefined) this.child_id = json.child_id

        return this
    }

    public toJSON(): any {
        /**
         * Converts the log date to a valid format if necessary
         */
        if (this.date) this.date = moment(this.date).format('YYYY-MM-DD')

        return {
            child_id: this.child_id,
            date: this.date,
            value: this.value,
            type: this.type
        }
    }
}

export enum LogType {
    STEPS = 'steps',
    CALORIES = 'calories',
    ACTIVE_MINUTES = 'active_minutes',
    LIGHTLY_ACTIVE_MINUTES = 'lightly_active_minutes',
    SEDENTARY_MINUTES = 'sedentary_minutes'
}
