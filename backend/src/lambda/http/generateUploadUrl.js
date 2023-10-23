import * as uuid from 'uuid'

import { generateUploadUrl, updateAttachmentUrl } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { getUserId } from '../utils.mjs'

const logger = createLogger('generateUploadUrl')

export const handler = async (event) => {
    logger.info('Processing generateUploadUrl event', { event })

    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    const attachmentId = uuid.v4()

    const uploadUrl = await generateUploadUrl(attachmentId)

    await updateAttachmentUrl(userId, todoId, attachmentId)

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            uploadUrl
        })
    }
}
