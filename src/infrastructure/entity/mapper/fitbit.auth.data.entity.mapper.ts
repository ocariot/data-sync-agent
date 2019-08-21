import { injectable } from 'inversify'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { FitbitAuthData } from '../../../application/domain/model/fitbit.auth.data'
import { FitbitAuthDataEntity } from '../fitbit.auth.data.entity'

@injectable()
export class FitbitAuthDataEntityMapper implements IEntityMapper<FitbitAuthData, FitbitAuthDataEntity> {

    public transform(item: any): any {
        if (item instanceof FitbitAuthData) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    /**
     * Convert {FitbitAuthData} for {FitbitAuthDataEntity}.
     *
     * @see Creation Date should not be mapped to the type the repository understands.
     * Because this attribute is created automatically by the database.
     * Therefore, if a null value is passed at update time, an exception is thrown.
     * @param item
     */
    public modelToModelEntity(item: FitbitAuthData): FitbitAuthDataEntity {
        const result: FitbitAuthDataEntity = new FitbitAuthDataEntity()

        if (item.id !== undefined) result.id = item.id
        if (item.access_token !== undefined) result.access_token = item.access_token
        if (item.expires_in !== undefined) result.expires_in = item.expires_in
        if (item.refresh_token !== undefined) result.refresh_token = item.refresh_token
        if (item.scope !== undefined) result.scope = item.scope
        if (item.user_id !== undefined) result.user_id = item.user_id
        if (item.token_type !== undefined) result.token_type = item.token_type

        return result
    }

    /**
     * Convert {FitbitAuthDataEntity} for {FitbitAuthData}.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param item
     */
    public modelEntityToModel(item: FitbitAuthDataEntity): FitbitAuthData {
        throw Error('Not implemented!')
    }

    /**
     * Convert JSON for FitbitAuthData.
     *
     * @see Each attribute must be mapped only if it contains an assigned value,
     * because at some point the attribute accessed may not exist.
     * @param json
     */
    public jsonToModel(json: any): FitbitAuthData {
        const result: FitbitAuthData = new FitbitAuthData()

        if (!json) return result
        if (json.id !== undefined) result.id = json.id
        if (json.access_token !== undefined) result.access_token = json.access_token
        if (json.expires_in !== undefined) result.expires_in = json.expires_in
        if (json.refresh_token !== undefined) result.refresh_token = json.refresh_token
        if (json.scope !== undefined) result.scope = json.scope
        if (json.user_id !== undefined) result.user_id = json.user_id
        if (json.token_type !== undefined) result.token_type = json.token_type

        return result
    }
}
