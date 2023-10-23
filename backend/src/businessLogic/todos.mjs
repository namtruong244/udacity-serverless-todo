import * as uuid from 'uuid'

import * as todosAccess from '../dataLayer/todosAccess.mjs'
import * as todosStorage from '../dataLayer/todosStorage.mjs'
import {createLogger} from '../utils/logger.mjs'

const logger = createLogger('todos')

export const getTodos = async (userId) => {
    logger.info(`Retrieving all todos for user ${userId}`, { userId })

    return await todosAccess.getTodoItems(userId)
}

export const createTodo = async (userId, createTodoRequest) => {
    const todoId = uuid.v4()

    const newItem = {
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: null,
        ...createTodoRequest
    }

    logger.info(`Creating todo ${todoId} for user ${userId}`, { userId, todoId, todoItem: newItem })

    await todosAccess.createTodoItem(newItem)

    return newItem
}

export const updateTodo = async (userId, todoId, updateTodoRequest) => {
    logger.info(`Updating todo ${todoId} for user ${userId}`, { userId, todoId, todoUpdate: updateTodoRequest })

    const item = await todosAccess.getTodoItem(todoId)

    if (!item)
        throw new Error('Item not found')  // FIXME: 404?

    if (item.userId !== userId) {
        logger.error(`User ${userId} does not have permission to update todo ${todoId}`)
        throw new Error('User is not authorized to update item')  // FIXME: 403?
    }

    await todosAccess.updateTodoItem(todoId, updateTodoRequest)
}

export const deleteTodo = async (userId, todoId) => {
    logger.info(`Deleting todo ${todoId} for user ${userId}`, { userId, todoId })

    const item = await todosAccess.getTodoItem(todoId)

    if (!item)
        throw new Error('Item not found')  // FIXME: 404?

    if (item.userId !== userId) {
        logger.error(`User ${userId} does not have permission to delete todo ${todoId}`)
        throw new Error('User is not authorized to delete item')  // FIXME: 403?
    }

    await todosAccess.deleteTodoItem(todoId)
}

export const updateAttachmentUrl = async (userId, todoId, attachmentId) => {
    logger.info(`Generating attachment URL for attachment ${attachmentId}`)

    const attachmentUrl = await todosStorage.getAttachmentUrl(attachmentId)

    logger.info(`Updating todo ${todoId} with attachment URL ${attachmentUrl}`, { userId, todoId })

    const item = await todosAccess.getTodoItem(todoId)

    if (!item)
        throw new Error('Item not found')  // FIXME: 404?

    if (item.userId !== userId) {
        logger.error(`User ${userId} does not have permission to update todo ${todoId}`)
        throw new Error('User is not authorized to update item')  // FIXME: 403?
    }

    await todosAccess.updateAttachmentUrl(todoId, attachmentUrl)
}

export const generateUploadUrl = async (attachmentId) => {
    logger.info(`Generating upload URL for attachment ${attachmentId}`)

    return await todosStorage.getUploadUrl(attachmentId)
}
