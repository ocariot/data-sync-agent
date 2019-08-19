import { IFitbitAuthDataService } from '../port/fitbit.auth.data.service.interface'
import { FitbitAuthData } from '../domain/model/fitbit.auth.data'
import { IQuery } from '../port/query.interface'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IFitbitAuthDataRepository } from '../port/fitbit.auth.data.repository.interface'
import { CreateFitbitAuthDataValidator } from '../domain/validator/create.fitbit.auth.data.validator'

@injectable()
export class FitbitAuthDataService implements IFitbitAuthDataService {
    constructor(
        @inject(Identifier.FITBIT_AUTH_DATA_REPOSITORY) private readonly _fitbitAuthDataRepo: IFitbitAuthDataRepository
    ) {
    }

    public add(item: FitbitAuthData): Promise<FitbitAuthData> {
        try {
            CreateFitbitAuthDataValidator.validate(item)
        } catch (err) {
            return Promise.reject(err)
        }
        return this._fitbitAuthDataRepo.create(item)
    }

    public getAll(query: IQuery): Promise<Array<FitbitAuthData>> {
        throw Error('Not implemented!')
    }

    public getById(id: string, query: IQuery): Promise<FitbitAuthData> {
        throw Error('Not implemented!')
    }

    public remove(id: string): Promise<boolean> {
        throw Error('Not implemented!')
    }

    public update(item: FitbitAuthData): Promise<FitbitAuthData> {
        throw Error('Not implemented!')
    }
}
