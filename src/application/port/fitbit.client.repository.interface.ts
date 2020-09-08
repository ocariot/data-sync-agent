export interface IFitbitClientRepository {
    revokeToken(accessToken: string): Promise<boolean>

    refreshToken(accessToken: string, refreshToken: string, expiresIn?: number): Promise<any>

    getTokenIntrospect(token: string): Promise<boolean>

    getDataFromPath(path: string, accessToken: string): Promise<any>
}
