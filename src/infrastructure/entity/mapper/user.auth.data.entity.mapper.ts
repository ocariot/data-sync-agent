import { injectable } from 'inversify'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { FitbitAuthData } from '../../../application/domain/model/fitbit.auth.data'
import { UserAuthData } from '../../../application/domain/model/user.auth.data'
import { UserAuthDataEntity } from '../user.auth.data.entity'
import { JsonUtils } from '../../../application/domain/utils/json.utils'

@injectable()
export class UserAuthDataEntityMapper implements IEntityMapper<UserAuthData, UserAuthDataEntity> {

    public transform(item: any): any {
        if (item instanceof UserAuthData) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    public modelToModelEntity(item: UserAuthData): UserAuthDataEntity {
        const result: UserAuthDataEntity = new UserAuthDataEntity()

        if (item.id !== undefined) result.id = item.id
        if (item.user_id !== undefined) result.user_id = item.user_id
        if (item.fitbit !== undefined) result.fitbit = item.fitbit.toJSON()
        return result
    }

    public modelEntityToModel(item: UserAuthDataEntity): UserAuthData {
        throw Error('Not implemented!')
    }

    public jsonToModel(json: any): UserAuthData {
        const result: UserAuthData = new UserAuthData()

        if (!json) return result
        if (json.id !== undefined) result.id = json.id
        if (json.user_id !== undefined) result.user_id = json.user_id
        if (json.fitbit !== undefined) result.fitbit = new FitbitAuthData().fromJSON(JsonUtils.cleanObject(json.fitbit))

        return result
    }
}
