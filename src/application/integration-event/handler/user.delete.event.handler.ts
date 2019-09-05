import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { ObjectIdValidator } from '../../domain/validator/object.id.validator'
import { DIContainer } from '../../../di/di'
import { ValidationException } from '../../domain/exception/validation.exception'

/**
 * Handler for UserDeleteEvent operation.
 *
 * @param event
 */
export const userDeleteEventHandler = async (event: any) => {

    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.user && !event.user.id) {
            throw new ValidationException('Event received but could not be handled due to an error in the event format.')
        }
        const childId: string = event.user.id

        // 1. Validate childId.
        ObjectIdValidator.validate(childId)

        // 2. Delete Child Data

        // 3. If got here, it's because the action was successful.
        logger.info(`Action for event ${event.event_name} successfully held!`)
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
