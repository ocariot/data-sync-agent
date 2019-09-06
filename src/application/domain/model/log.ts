import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { Entity } from './entity'
import moment from 'moment'

/**
 * Entity implementation of the individual log of the PhysicalActivity.
 *
 * @implements {IJSONSerializable, IJSONDeserializable<Log>}
 */
export class Log extends Entity implements IJSONSerializable, IJSONDeserializable<Log> {
    private _date!: string // Date of the log according to the format yyyy-MM-dd.
    private _value!: number // Log value.
    private _type!: string // Log type
    private _user_id!: string // Child ID

    constructor(date?: string, value?: number, type?: string, user_id?: string) {
        super()
        if (date) this.date = date
        if (value) this.value = value
        if (type) this.type = type
        if (user_id) this.user_id = user_id
    }

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

    get user_id(): string {
        return this._user_id
    }

    set user_id(value: string) {
        this._user_id = value
    }

    public fromJSON(json: any): Log {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.id !== undefined) super.id = json.id
        if (json.type !== undefined) this.type = json.type
        if (json.date !== undefined) this.date = json.date
        if (json.value !== undefined) this.value = json.value
        if (json.user_id !== undefined) this.user_id = json.user_id

        return this
    }

    public toJSON(): any {
        /**
         * Converts the log date to a valid format if necessary
         */
        if (this.date) this.date = moment(this.date).format('YYYY-MM-DD')

        return {
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
