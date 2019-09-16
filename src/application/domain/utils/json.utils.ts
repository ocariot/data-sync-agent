export class JsonUtils {
    /**
     * Checks if a string is in json format.
     *
     * @param str
     */
    public static isJsonString(str): boolean {
        try {
            return typeof JSON.parse(str) === 'object'
        } catch (e) {
            return false
        }
    }

    public static cleanObject(json: any): any {
        for (const prop of Object.keys(json)) {
            if (json[prop] instanceof Object) json[prop] = this.cleanObject(json[prop])
            if (json[prop] === undefined || json[prop] === null) delete json[prop]
        }
        return json
    }
}
