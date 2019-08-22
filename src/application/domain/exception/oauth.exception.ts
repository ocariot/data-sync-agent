import { Exception } from './exception'

export class OAuthException extends Exception {
    public type?: string

    constructor(type: string, message: string, description?: string) {
        super(message, description)
        this.type = type
    }
}
