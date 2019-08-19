import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { BaseRepository } from './base/base.repository'
import { ILogger } from '../../utils/custom.logger'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { FitbitAuthData } from '../../application/domain/model/fitbit.auth.data'
import { FitbitAuthDataEntity } from '../entity/fitbit.auth.data.entity'
import { IFitbitAuthDataRepository } from '../../application/port/fitbit.auth.data.repository.interface'

@injectable()
export class FitbitAuthDataRepository extends BaseRepository<FitbitAuthData, FitbitAuthDataEntity>
    implements IFitbitAuthDataRepository {
    constructor(
        @inject(Identifier.FITBIT_AUTH_DATA_REPO_MODEL) readonly _fitbitAuthDataRepoModel: any,
        @inject(Identifier.FITBIT_AUTH_DATA_ENTITY_MAPPER)
        readonly _fitbitAuthDataEntityMapper: IEntityMapper<FitbitAuthData, FitbitAuthDataEntity>,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
        super(_fitbitAuthDataRepoModel, _fitbitAuthDataEntityMapper, _logger)
    }
}
