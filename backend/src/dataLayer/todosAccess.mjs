import AWS from 'aws-sdk'
// import AWSXRay from 'aws-xray-sdk'

import {createLogger} from '../utils/logger.mjs'

const logger = createLogger('todosAccess')

// const XAWS = AWSXRay.captureAWS(AWS)

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const todosByUserIndex = process.env.TODOS_BY_USER_INDEX

export const todoItemExists = async (todoId) => {
    const item = await getTodoItem(todoId)
    return !!item
}

export const getTodoItems = async (userId) => {
    logger.info(`Getting all todos for user ${userId} from ${todosTable}`)

    const result = await docClient.query({
        TableName: todosTable,
        IndexName: todosByUserIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise()

    const items = result.Items

    logger.info(`Found ${items.length} todos for user ${userId} in ${todosTable}`)

    return items
}

export const getTodoItem = async (todoId) => {
    logger.info(`Getting todo ${todoId} from ${todosTable}`)

    const result = await docClient.get({
        TableName: todosTable,
        Key: {
            todoId
        }
    }).promise()

    return result.Item
}

export const createTodoItem = async (todoItem) => {
    logger.info(`Putting todo ${todoItem.todoId} into ${todosTable}`)

    await docClient.put({
        TableName: todosTable,
        Item: todoItem,
    }).promise()
}

export const updateTodoItem = async (todoId, todoUpdate) => {
    logger.info(`Updating todo item ${todoId} in ${todosTable}`)

    await docClient.update({
        TableName: todosTable,
        Key: {
            todoId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
            "#name": "name"
        },
        ExpressionAttributeValues: {
            ":name": todoUpdate.name,
            ":dueDate": todoUpdate.dueDate,
            ":done": todoUpdate.done
        }
    }).promise()
}

export const deleteTodoItem = async (todoId) => {
    logger.info(`Deleting todo item ${todoId} from ${todosTable}`)

    await docClient.delete({
        TableName: todosTable,
        Key: {
            todoId
        }
    }).promise()
}

export const updateAttachmentUrl = async (todoId, attachmentUrl) => {
    logger.info(`Updating attachment URL for todo ${todoId} in ${todosTable}`)

    await docClient.update({
        TableName: todosTable,
        Key: {
            todoId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
            ':attachmentUrl': attachmentUrl
        }
    }).promise()
}
