import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
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
        super.type = MeasurementType.BODY_FAT
        super.unit = '%'
    }

    public fromJSON(json: any): BodyFat {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        super.fromJSON(json)
        return this
    }

    public toJSON(): any {
        return super.toJSON()
    }
}
