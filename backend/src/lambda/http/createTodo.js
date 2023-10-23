import { createLogger } from '../../utils/logger.mjs'
import {getUserId} from '../utils.mjs'
import {createTodo} from '../../businessLogic/todos.mjs'


const logger = createLogger('createTodo')

export async function handler(event) {
    logger.info('Processing createTodo event', { event })

    const userId = getUserId(event)
    const newTodo = JSON.parse(event.body)

    const newItem = await createTodo(userId, newTodo)

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item: newItem
        })
    }
}
