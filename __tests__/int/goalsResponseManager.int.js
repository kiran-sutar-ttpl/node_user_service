/* eslint-disable no-use-before-define */
const AWS = require('aws-sdk')
const moment = require('moment')
const goalsResponseManager = require('../../src/v3_goalsResponseManager')

const createGolaRequest = require('../jsons/createGolaReqInt.json')
const deleteGoalRequest = require('../jsons/deleteGoalReqInt.json')
const retrieveClientGoalsRequest = require('../jsons/retrieveClientGoalsReqInt.json')
const retrieveUserGoalsRequest = require('../jsons/retrieveUserGoalsReqInt.json')

AWS.config.update({ region: process.env.REGION })

beforeAll(async () => {
    await createUser()
})

afterAll(async () => {
    await deleteUser()
    await deleteUserGoals(USER_ID)
})

const USER_ID = 'userc00-cd4f-11ec-9d64-0242ac120002'
const CLIENT_ID = 'clientb140-af22-45e5-b1f9-4210bf523b45'
const USER_EMAIL = 'integration.test.thinkitive@getnada.com'
const PILOT_TAG = 'thinkitive 2'

it('should be able to create goal', async () => {
    const result = await goalsResponseManager.handler(createGolaRequest)
    expect(result).toHaveProperty('message')
    expect(result.message).toBe('1 where added')
})

it('should be able to delete goal', async () => {
    const result = await goalsResponseManager.handler(deleteGoalRequest)
    console.log('d res', result)
})

it('should be able to retrieve client goals', async () => {
    const result = await goalsResponseManager.handler(retrieveClientGoalsRequest)
    for (let i = 0; i < result.length; i++) {
        expect(result[i]).toHaveProperty('userId')
        expect(result[i]).toHaveProperty('goalId')
        expect(result[i]).toHaveProperty('clientId')
        expect(result[i].clientId).toBe(CLIENT_ID)
        expect(result[i]).toHaveProperty('goalTag')
        expect(result[i]).toHaveProperty('isForSomebodyElse')
    }
})

it('should be able to retrieve user goals', async () => {
    const result = await goalsResponseManager.handler(retrieveUserGoalsRequest)
    for (let i = 0; i < result.length; i++) {
        expect(result[i]).toHaveProperty('goalId')
        expect(result[i]).toHaveProperty('goalTag')
        expect(result[i]).toHaveProperty('isForSomebodyElse')
    }
})

const createUser = async () => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION })

    const createUser = {
        TableName: process.env.USERS_PROFILES_TABLE_NAME,
        Item: {
            active: true,
            announceNewFeature: true,
            assessmentState: false,
            assessmentUpdateState: 'NTNU',
            budget: 14905,
            clientId: CLIENT_ID,
            companyBudget: 10000,
            department: 'IT',
            email: USER_EMAIL,
            familyName: 'fe2',
            givenName: 'test',
            locale: {
                currency: 'GBP',
            },
            personalBudget: 0,
            pilotTag: PILOT_TAG,
            privacyPolicyRead: false,
            profileCreationDate: moment().toISOString(),
            role: 'Manager',
            tags: [],
            userId: USER_ID,
        },
    }

    await documentClient.put(createUser)
        .promise()
        .then((data) => data)
        .catch((err) => err)
}

const getUserGoalsByUserId = async (userId) => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION })

    const params = {
        TableName: process.env.USER_GOALS_TABLE_NAME,
        IndexName: 'userId-index',
        KeyConditionExpression: '#userId = :userId',
        ExpressionAttributeNames: { '#userId': 'userId' },
        ExpressionAttributeValues: { ':userId': userId },
        ScanIndexForward: false,
    }

    const response = await documentClient.query(params)
        .promise()
        .then((data) => data)
        .catch((err) => {
            console.log('Error querying user goals', err)
            console.log('params ', params)

            throw new Error('Error querying user goals')
        })

    const responseToSend = response
    while (response.LastEvaluatedKey !== undefined) {
        params.ExclusiveStartKey = response.LastEvaluatedKey

        // eslint-disable-next-line no-await-in-loop
        const result = await documentClient.query(params)
            .promise()
            .then((data) => data)
            .catch((err) => {
                console.log('Error querying user goals', err)
                throw Error('Error querying user goals')
            })

        responseToSend.Items = responseToSend.Items.concat(result.Items)

        response.LastEvaluatedKey = result.LastEvaluatedKey
    }
    return response.Items
}

const deleteUser = async () => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION })

    const deleteUser = {
        Key: {
            userId: USER_ID,
        },
        TableName: process.env.USERS_PROFILES_TABLE_NAME,
    }

    await documentClient.delete(deleteUser)
        .promise()
        .then((data) => data)
        .catch((err) => err)
}

const deleteUserGoals = async (userId) => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION })

    const userGoals = await getUserGoalsByUserId(userId)

    for (let i = 0; i < userGoals.length; i++) {
        const deleteGoal = {
            Key: {
                goalId: userGoals[i].goalId,
            },
            TableName: process.env.USER_GOALS_TABLE_NAME,
        }

        // eslint-disable-next-line no-await-in-loop
        await documentClient.delete(deleteGoal)
            .promise()
            .then((data) => data)
            .catch((err) => err)
    }
}
