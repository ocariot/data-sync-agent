import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { DatetimeValidator } from '../validator/datetime.validator'
import { Measurement, MeasurementType } from './measurement'

/**
 * Entity implementation for body_fat measurements.
 *
 * @extends {Entity}
 * @implements {IJSONSerializable, IJSONDeserializable<BodyFat>}
 */
export class BodyFat extends Measurement implements IJSONSerializable, IJSONDeserializable<BodyFat> {

    constructor() {
        super()
        this.type = MeasurementType.BODY_FAT
        this.unit = '%'
    }

    public convertDatetimeString(value: string): Date {
        DatetimeValidator.validate(value)
        return new Date(value)
    }

    public fromJSON(json: any): BodyFat {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.id !== undefined) super.id = json.id
        if (json.timestamp !== undefined) this.timestamp = this.convertDatetimeString(json.timestamp)
        if (json.value !== undefined) this.value = json.value
        if (json.child_id !== undefined) this.child_id = json.child_id

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            timestamp: this.timestamp,
            value: this.value,
            unit: this.unit,
            child_id: this.child_id
        }
    }
}
