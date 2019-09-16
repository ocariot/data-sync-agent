import { Resource } from '../../../src/application/domain/model/resource'
import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { IResourceRepository } from '../../../src/application/port/resource.repository.interface'
import { ResourceRepository } from '../../../src/infrastructure/repository/resource.repository'
import { ResourceRepoModel } from '../../../src/infrastructure/database/schema/resource.schema'
import { EntityMapperMock } from '../../mocks/models/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { assert } from 'chai'
import sinon from 'sinon'

require('sinon-mongoose')

describe('Repositories: ResourceRepository', () => {
    const modelFake: any = ResourceRepoModel
    const resource: Resource = new Resource().fromJSON(DefaultEntityMock.RESOURCE)
    const repo: IResourceRepository = new ResourceRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())

    afterEach(() => {
        sinon.restore()
    })

    describe('checkExists()', () => {
        context('when check if a resource exists', () => {
            it('should return true', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ _id: resource.id })
                    .chain('exec')
                    .resolves(resource)

                return repo.checkExists(new Query().fromJSON({ filters: { _id: resource.id } }))
                    .then(res => {
                        assert.isTrue(res)
                    })
            })
        })

        context('when the resource does not exists', () => {
            it('should return false', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ _id: resource.id })
                    .chain('exec')
                    .resolves(undefined)

                return repo.checkExists(new Query().fromJSON({ filters: { _id: resource.id } }))
                    .then(res => {
                        assert.isFalse(res)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should reject an error', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ _id: resource.id })
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return repo.checkExists(new Query().fromJSON({ filters: { _id: resource.id } }))
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
