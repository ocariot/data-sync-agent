import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { PhysicalActivityLevel } from './physical.activity.level'
import { Activity } from './activity'
import { PhysicalActivityHeartRate } from './physical.activity.heart.rate'

/**
 * Implementation of the physical physicalactivity entity.
 *
 * @extends {Entity}
 * @implements { IJSONSerializable, IJSONDeserializable<Activity>
 */
export class PhysicalActivity extends Activity implements IJSONSerializable, IJSONDeserializable<PhysicalActivity> {
    private _name?: string // Name of physical physicalactivity.
    private _calories?: number // Calories spent during physical physicalactivity.
    private _steps?: number // Number of steps taken during the physical physicalactivity.
    private _levels?: Array<PhysicalActivityLevel> // PhysicalActivity levels (sedentary, light, fair or very).
    private _heart_rate?: PhysicalActivityHeartRate // PhysicalActivity heart rate

    constructor() {
        super()
    }

    get name(): string | undefined {
        return this._name
    }

    set name(value: string | undefined) {
        this._name = value
    }

    get calories(): number | undefined {
        return this._calories
    }

    set calories(value: number | undefined) {
        this._calories = value
    }

    get steps(): number | undefined {
        return this._steps
    }

    set steps(value: number | undefined) {
        this._steps = value
    }

    get levels(): Array<PhysicalActivityLevel> | undefined {
        return this._levels
    }

    set levels(value: Array<PhysicalActivityLevel> | undefined) {
        this._levels = value
    }

    get heart_rate(): PhysicalActivityHeartRate | undefined {
        return this._heart_rate
    }

    set heart_rate(value: PhysicalActivityHeartRate | undefined) {
        this._heart_rate = value
    }

    public fromJSON(json: any): PhysicalActivity {
        if (!json) return this
        super.fromJSON(json)

        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.name !== undefined) this.name = json.name
        if (json.calories !== undefined) this.calories = json.calories
        if (json.steps !== undefined) this.steps = json.steps
        if (json.levels !== undefined && json.levels instanceof Array) {
            this.levels = json.levels.map(level => new PhysicalActivityLevel().fromJSON(level))
        }
        if (json.heart_rate) this.heart_rate = new PhysicalActivityHeartRate().fromJSON(json.heart_rate)

        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{
                name: this.name,
                calories: this.calories,
                steps: this.steps,
                levels: this.levels ? this.levels.map(item => item.toJSON()) : this.levels,
                heart_rate: this.heart_rate ? this.heart_rate.toJSON() : this.heart_rate
            }
        }
    }
}
