import { IResourceRepository } from '../../../src/application/port/resource.repository.interface'
import { IQuery } from '../../../src/application/port/query.interface'
import { Resource } from '../../../src/application/domain/model/resource'
import { DefaultEntityMock } from '../models/default.entity.mock'

const data: Resource = new Resource().fromJSON(DefaultEntityMock.RESOURCE)

export class ResourceRepositoryMock implements IResourceRepository {
    public checkExists(query: IQuery): Promise<boolean> {
        const q: any = query.toJSON()
        return Promise.resolve(q.filters.resource_id === DefaultEntityMock.RESOURCE.resource_id)
    }

    public count(query: IQuery): Promise<number> {
        return Promise.resolve(1)
    }

    public create(item: Resource): Promise<Resource> {
        return Promise.resolve(item)
    }

    public delete(id: string): Promise<boolean> {
        return Promise.resolve(true)
    }

    public find(query: IQuery): Promise<Array<Resource>> {
        return Promise.resolve([data])
    }

    public findOne(query: IQuery): Promise<Resource> {
        return Promise.resolve(data)
    }

    public update(item: Resource): Promise<Resource> {
        return Promise.resolve(item)
    }

}
