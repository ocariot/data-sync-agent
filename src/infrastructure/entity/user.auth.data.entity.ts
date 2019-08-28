import { FitbitAuthDataEntity } from './fitbit.auth.data.entity'

export class UserAuthDataEntity {
    public id?: string
    public user_id?: string
    public last_sync?: string
    public fitbit?: FitbitAuthDataEntity

}
