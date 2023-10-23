import { deleteTodo } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'

const logger = createLogger('deleteTodo')

export const handler = async (event) => {
    logger.info('Processing deleteTodo event', { event })

    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId

    await deleteTodo(userId, todoId)

    return {
        statusCode: 204,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: ''
    }
}
