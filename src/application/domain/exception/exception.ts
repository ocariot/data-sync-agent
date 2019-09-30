/**
 * General exceptions of the application.
 * The other exceptions should inherit it.
 * 
 * Can not be instantiated. 
 * To create an instance of type exceptions use the
 * specific exceptions or implement one that inherits this.
 * 
 * @abstract
 * @extends {Error}
 */
export abstract class Exception extends Error {
    public description?: string

    /**
     * Creates an instance of Exception.
     *
     * @param message Short message
     * @param description Detailed message
     */
    protected constructor(message: string, description?: string) {
        super(message)
        this.description = description
    }
}
