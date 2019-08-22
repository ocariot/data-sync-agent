import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { Measurement, MeasurementType } from './measurement'
import { BodyFat } from './body.fat'

/**
 * Entity implementation for weight measurements.
 *
 * @extends {Entity}
 * @implements {IJSONSerializable, IJSONDeserializable<Weight>}
 */
export class Weight extends Measurement implements IJSONSerializable, IJSONDeserializable<Weight> {
    private _body_fat?: BodyFat // Object of body_fat measurement associated with the weight measurement.

    constructor() {
        super()
        this.type = MeasurementType.WEIGHT
    }

    get body_fat(): BodyFat | undefined {
        return this._body_fat
    }

    set body_fat(value: BodyFat | undefined) {
        this._body_fat = value
    }

    public fromJSON(json: any): Weight {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.id !== undefined) super.id = json.id
        if (json.timestamp !== undefined) this.timestamp = this.convertDatetimeString(json.timestamp)
        if (json.value !== undefined) this.value = json.value
        if (json.unit !== undefined) this.unit = json.unit
        if (json.child_id !== undefined) this.child_id = json.child_id
        if (json.body_fat !== undefined) {
            this.body_fat = new BodyFat().fromJSON(json)
            this.body_fat.value = json.body_fat
        }

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            timestamp: this.timestamp,
            value: this.value,
            unit: this.unit,
            child_id: this.child_id,
            body_fat: this.body_fat ? this.body_fat.value : undefined
        }
    }
}
