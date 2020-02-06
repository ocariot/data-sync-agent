import { injectable } from 'inversify'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { Resource } from '../../../application/domain/model/resource'
import { ResourceEntity } from '../resource.entity'

@injectable()
export class ResourceEntityMapper implements IEntityMapper<Resource, ResourceEntity> {
    public transform(item: any): any {
        if (item instanceof Resource) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    public modelToModelEntity(item: Resource): ResourceEntity {
        const result: ResourceEntity = new ResourceEntity()

        if (item.id !== undefined) result.id = item.id
        if (item.type !== undefined) result.type = item.type
        if (item.user_id !== undefined) result.user_id = item.user_id
        if (item.resource !== undefined) result.resource = item.resource
        if (item.date_sync !== undefined) result.date_sync = item.date_sync
        if (item.provider !== undefined) result.provider = item.provider

        return result
    }

    public modelEntityToModel(item: ResourceEntity): Resource {
        throw Error('Not implemented!')
    }

    public jsonToModel(json: any): Resource {
        const result: Resource = new Resource()

        if (!json) return result

        if (json.id !== undefined) result.id = json.id
        if (json.type !== undefined) result.type = json.type
        if (json.user_id !== undefined) result.user_id = json.user_id
        if (json.resource !== undefined) result.resource = json.resource
        if (json.date_sync !== undefined) result.date_sync = json.date_sync
        if (json.provider !== undefined) result.provider = json.provider

        return result
    }

}
