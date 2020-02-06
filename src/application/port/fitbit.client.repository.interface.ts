export interface IFitbitClientRepository {
    revokeToken(accessToken: string): Promise<boolean>

    refreshToken(accessToken: string, refreshToken: string, expiresIn?: number): Promise<any>

    getDataFromPath(path: string, accessToken: string): Promise<any>
}
