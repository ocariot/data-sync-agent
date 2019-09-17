import { DefaultEntityMock } from '../../mocks/models/default.entity.mock'
import { UserAuthRepoModel } from '../../../src/infrastructure/database/schema/oauth.data.schema'
import { assert } from 'chai'
import sinon from 'sinon'
import { UserAuthData } from '../../../src/application/domain/model/user.auth.data'
import { IUserAuthDataRepository } from '../../../src/application/port/user.auth.data.repository.interface'
import { UserAuthDataRepository } from '../../../src/infrastructure/repository/user.auth.data.repository'
import { EntityMapperMock } from '../../mocks/models/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { EventBusRabbitMQMock } from '../../mocks/eventbus/eventbus.rabbitmq.mock'
import { Query } from '../../../src/infrastructure/repository/query/query'

require('sinon-mongoose')

describe('Repositories: UserAuthDataRepository', () => {
    const modelFake: any = UserAuthRepoModel
    const data: UserAuthData = new UserAuthData().fromJSON(DefaultEntityMock.USER_AUTH_DATA)
    const repo: IUserAuthDataRepository = new UserAuthDataRepository(
        modelFake, new EntityMapperMock(), new EventBusRabbitMQMock(), new CustomLoggerMock()
    )
    afterEach(() => {
        sinon.restore()
    })

    describe('deleteByQuery()', () => {
        context('when delete a resource by query', () => {
            it('should return true', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ user_id: data.user_id })
                    .chain('exec')
                    .resolves({ deleted: true })

                return repo.deleteByQuery(new Query().fromJSON({ filters: { user_id: data.user_id } }))
                    .then(res => {
                        assert.isTrue(res)
                    })
            })
        })

        context('when the resource does not exists', () => {
            it('should return true', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ user_id: data.user_id })
                    .chain('exec')
                    .resolves({ deleted: false })

                return repo.deleteByQuery(new Query().fromJSON({ filters: { user_id: data.user_id } }))
                    .then(res => {
                        assert.isTrue(res)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should reject an error', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ user_id: data.user_id })
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return repo.deleteByQuery(new Query().fromJSON({ filters: { user_id: data.user_id } }))
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('checkUserExists()', () => {
        context('when check if a user exists', () => {
            it('should return true', () => {
                return repo.checkUserExists(DefaultEntityMock.USER_IDS.child_id)
                    .then(res => {
                        assert.isTrue(res)
                    })
            })
        })
        context('when user does not exists', () => {
            it('should return false', () => {
                return repo.checkUserExists(DefaultEntityMock.USER_IDS.does_not_exists)
                    .then(res => {
                        assert.isFalse(res)
                    })
            })
        })
        context('when a error occurs', () => {
            it('should reject an error', () => {
                return repo.checkUserExists('error')
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An error occurs!')
                    })
            })
        })
    })

    describe('getUserAuthDataByUserId()', () => {
        context('when check if a resource exists', () => {
            it('should return true', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ user_id: DefaultEntityMock.USER_IDS.child_id })
                    .chain('exec')
                    .resolves(data)

                return repo.getUserAuthDataByUserId(DefaultEntityMock.USER_IDS.child_id)
                    .then(res => {
                        assert.deepEqual(res, data)
                    })
            })
        })

        context('when the resource does not exists', () => {
            it('should return false', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ user_id: DefaultEntityMock.USER_IDS.child_id })
                    .chain('exec')
                    .resolves(undefined)

                return repo.getUserAuthDataByUserId(DefaultEntityMock.USER_IDS.child_id)
                    .then(res => {
                        assert.isUndefined(res)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should reject an error', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ user_id: DefaultEntityMock.USER_IDS.child_id })
                    .chain('exec')
                    .rejects({
                        message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...'
                    })

                return repo.getUserAuthDataByUserId(DefaultEntityMock.USER_IDS.child_id)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
