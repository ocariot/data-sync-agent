import { IQuery } from './query.interface'
import { IRepository } from './repository.interface'
import { Resource } from '../domain/model/resource'

export interface IResourceRepository extends IRepository<Resource>{
    checkExists(query: IQuery): Promise<boolean>
}
