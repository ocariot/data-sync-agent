import { HeartRateZone } from './heart.rate.zone'
import { JsonUtils } from '../utils/json.utils'

export class PhysicalActivityHeartRate {
    private _average?: number // Average heart rate
    private _out_of_range_zone?: HeartRateZone // 'Out of Range' heart rate zone
    private _fat_burn_zone?: HeartRateZone // 'Fat Burn' heart rate zone
    private _cardio_zone?: HeartRateZone // 'Cardio' heart rate zone
    private _peak_zone?: HeartRateZone // 'Peak' heart rate zone

    get average(): number | undefined {
        return this._average
    }

    set average(value: number | undefined) {
        this._average = value
    }

    get out_of_range_zone(): HeartRateZone | undefined {
        return this._out_of_range_zone
    }

    set out_of_range_zone(value: HeartRateZone | undefined) {
        this._out_of_range_zone = value
    }

    get fat_burn_zone(): HeartRateZone | undefined {
        return this._fat_burn_zone
    }

    set fat_burn_zone(value: HeartRateZone | undefined) {
        this._fat_burn_zone = value
    }

    get cardio_zone(): HeartRateZone | undefined {
        return this._cardio_zone
    }

    set cardio_zone(value: HeartRateZone | undefined) {
        this._cardio_zone = value
    }

    get peak_zone(): HeartRateZone | undefined {
        return this._peak_zone
    }

    set peak_zone(value: HeartRateZone | undefined) {
        this._peak_zone = value
    }

    public fromJSON(json: any): PhysicalActivityHeartRate {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.average !== undefined) this.average = json.average
        if (json.out_of_range_zone !== undefined) this.out_of_range_zone = new HeartRateZone().fromJSON(json.out_of_range_zone)
        if (json.fat_burn_zone !== undefined) this.fat_burn_zone = new HeartRateZone().fromJSON(json.fat_burn_zone)
        if (json.cardio_zone !== undefined) this.cardio_zone = new HeartRateZone().fromJSON(json.cardio_zone)
        if (json.peak_zone !== undefined) this.peak_zone = new HeartRateZone().fromJSON(json.peak_zone)

        return this
    }

    public toJSON(): any {
        return {
            average: this.average,
            out_of_range_zone: this.out_of_range_zone ? this.out_of_range_zone.toJSON() : this.out_of_range_zone,
            fat_burn_zone: this.fat_burn_zone ? this.fat_burn_zone.toJSON() : this.fat_burn_zone,
            cardio_zone: this.cardio_zone ? this.cardio_zone.toJSON() : this.cardio_zone,
            peak_zone: this.peak_zone ? this.peak_zone.toJSON() : this.peak_zone
        }
    }
}
