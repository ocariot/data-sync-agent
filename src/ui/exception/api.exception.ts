import { Exception } from '../../application/domain/exception/exception'

/**
 * Exception implementation that is thrown to
 * the client when an error occurs.
 *
 * @extends {Exception}
 */
export class ApiException extends Exception {
    public code: number
    public description?: string
    public redirect_link?: string

    /**
     * Creates an instance of ApiException.
     *
     * @param code HTTP status code
     * @param message Short message
     * @param description Detailed message
     * @param redirect_link Link to perform the error handling or for more information.
     */
    constructor(code: number, message: string, description?: string, redirect_link?: string) {
        super(message)
        this.code = code
        this.description = description
        this.redirect_link = redirect_link
    }

    /**
     * Mounts default error message.
     *
     * @return Object
     */
    public toJson(): object {
        return {
            code: this.code,
            message: this.message,
            description: this.description,
            redirect_link: this.redirect_link
        }
    }
}
