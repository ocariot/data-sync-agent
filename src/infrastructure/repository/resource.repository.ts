import { BaseRepository } from './base/base.repository'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { ILogger } from '../../utils/custom.logger'
import { Resource } from '../../application/domain/model/resource'
import { ResourceEntity } from '../entity/resource.entity'
import { IResourceRepository } from '../../application/port/resource.repository.interface'
import { IQuery } from '../../application/port/query.interface'

@injectable()
export class ResourceRepository extends BaseRepository<Resource, ResourceEntity> implements IResourceRepository {

    constructor(
        @inject(Identifier.RESOURCE_REPO_MODEL) readonly _resourceRepoModel: any,
        @inject(Identifier.RESOURCE_ENTITY_MAPPER) readonly _resourceEntityMapper: IEntityMapper<Resource, ResourceEntity>,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
        super(_resourceRepoModel, _resourceEntityMapper, _logger)
    }

    public checkExists(query: IQuery): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.findOne(query)
                .then(res => resolve(!!res))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public deleteByQuery(query: IQuery): Promise<boolean> {
        const q: any = query.toJSON()
        return new Promise<boolean>((resolve, reject) => {
            this.Model.deleteMany(q.filters)
                .then(res => resolve(!!res))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }
}
