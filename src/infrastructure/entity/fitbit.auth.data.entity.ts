import { UserAuthDataEntity } from './user.auth.data.entity'

export class FitbitAuthDataEntity extends UserAuthDataEntity {
    public user_id?: string
    public access_token?: string
    public expires_in?: number
    public refresh_token?: string
    public scope?: string
    public last_sync?: string
    public token_type?: string
    public status?: string
}
