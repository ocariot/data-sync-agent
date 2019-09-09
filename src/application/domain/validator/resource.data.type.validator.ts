import { ValidationException } from '../exception/validation.exception'
import { ResourceDataType } from '../utils/resource.data.type'

export class ResourceDataTypeValidator {
    public static validate(type: ResourceDataType): void | ValidationException {
        if (!(Object.values(ResourceDataType).includes(type))) {
            throw new ValidationException(`Value not mapped for resource data type: ${type}`,
                `The mapped values are: ${Object.values(ResourceDataType).join(',')}.`)
        }
    }
}
