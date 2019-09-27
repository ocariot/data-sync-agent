import { FitbitAuthData } from '../model/fitbit.auth.data'
import { OAuthException } from '../exception/oauth.exception'
import moment from 'moment'

export class VerifyFitbitAuthValidator {
    public static validate(data: FitbitAuthData): void | OAuthException {
        if (data.status === 'invalid_token') {
            throw new OAuthException(
                'invalid_token',
                `The access token is invalid: ${data.access_token}`,
                'Please make a new Fitbit Auth data and try again.')
        }
        if (data.status === 'invalid_grant') {
            throw new OAuthException(
                'invalid_grant',
                `The refresh token is invalid: ${data.access_token}`,
                'Please make a new Fitbit Auth data and try again.')
        }
        if (isExpiredToken(data.expires_in!)) {
            throw new OAuthException(
                'expired_token',
                'The access token is expired.',
                'It is necessary refresh token before continue.')
        }
    }
}

function isExpiredToken(exp: number): boolean {
    return moment(new Date()).isAfter(new Date(exp * 1000))
}
