import { IEntityMapper } from '../../../src/infrastructure/port/entity.mapper.interface'

export class EntityMapperMock implements IEntityMapper<any, any> {

    public transform(item: any): any {
        return item
    }

    public jsonToModel(json: any): any {
        return json
    }

    public modelEntityToModel(item: any): any {
        return item
    }

    public modelToModelEntity(item: any): any {
        return item
    }
}
