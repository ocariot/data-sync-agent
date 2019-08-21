import { IService } from './service.interface'

/**
 * Service interface.
 * Must be implemented by all other service created.
 *
 * @template T
 */
export interface IOAuthServiceInterface<T> extends IService<T> {
    getAuthorizeUrl(userId: string, redirectUri: string): Promise<string>

    getAccessToken(userId: string, code: string): Promise<T>

    refreshToken(accessToken: string, refreshToken: string, params?: any): Promise<T>

    revokeToken(accessToken: string): Promise<boolean>
}
