import { Exception } from './exception'

export class FitbitClientException extends Exception {
    constructor(public type: string, public message: string, public description?: string) {
        super(message, description)
        this.type = type
    }
}
