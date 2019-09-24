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

    public modelToModelEntity(item: FitbitAuthData): FitbitAuthDataEntity {
        const result: FitbitAuthDataEntity = new FitbitAuthDataEntity()

        if (item.access_token !== undefined) result.access_token = item.access_token
        if (item.expires_in !== undefined) result.expires_in = item.expires_in
        if (item.refresh_token !== undefined) result.refresh_token = item.refresh_token
        if (item.scope !== undefined) result.scope = item.scope
        if (item.token_type !== undefined) result.token_type = item.token_type
        if (item.user_id !== undefined) result.user_id = item.user_id
        if (item.last_sync !== undefined) result.last_sync = item.last_sync
        if (item.status !== undefined) result.status = item.status

        return result
    }

    public modelEntityToModel(item: FitbitAuthDataEntity): FitbitAuthData {
        throw Error('Not implemented!')
    }

    public jsonToModel(json: any): FitbitAuthData {
        const result: FitbitAuthData = new FitbitAuthData()

        if (!json) return result
        if (json.access_token !== undefined) result.access_token = json.access_token
        if (json.expires_in !== undefined) result.expires_in = json.expires_in
        if (json.refresh_token !== undefined) result.refresh_token = json.refresh_token
        if (json.scope !== undefined) result.scope = json.scope
        if (json.token_type !== undefined) result.token_type = json.token_type
        if (json.user_id !== undefined) result.user_id = json.user_id
        if (json.last_sync !== undefined) result.last_sync = json.last_sync
        if (json.status !== undefined) result.status = json.status

        return result
    }

}
