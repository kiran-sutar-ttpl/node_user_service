/* eslint-disable no-use-before-define */
const AWS = require('aws-sdk')
const moment = require('moment')

const usersProfilesResponseManager = require('../../src/usersProfilesResponseManager')
const createUserRequest = require('../jsons/createUserReqInt.json')
const retrieveUserRequestByUser = require('../jsons/retrieveUserReqByUserInt.json')
const retrieveUserRequestByAdmin = require('../jsons/retrieveUserReqByAdminInt.json')
const updateUserRequestByUser = require('../jsons/updateUserRequestByUserInt.json')
const updateUserRequestByAdmin = require('../jsons/updateUserRequestByAdminInt.json')
// const updateUserBudgetRequestByUser = require('../jsons/updateUserBudgetRequestByUserInt.json')
const updateUserBudgetRequestByAdmin = require('../jsons/updateUserBudgetRequestByAdminInt.json')
const deleteUserRequest = require('../jsons/deleteUserRequestInt.json')
const chargeUserRequestByUser = require('../jsons/chargeUserRequestByUserInt.json')
const chargeUserRequestByAdmin = require('../jsons/chargeUserRequestByAdminInt.json')
const refundUserRequestByUser = require('../jsons/refundUserRequestByUserInt.json')
const refundUserRequestByAdmin = require('../jsons/refundUserRequestByAdminInt.json')

AWS.config.update({ region: process.env.REGION })

beforeEach(async () => {
    await createUser()
})

beforeAll(async () => {
    await createClient()
    await createResource()
    await createTransactions()
})

afterAll(async () => {
    await deleteUser()
    await deleteClient()
    await deleteResource()
    await deleteTransactions()
})

it('should be able to create user', async () => {
    const result = await usersProfilesResponseManager.handler(createUserRequest)
    expect(result).toHaveProperty('ConsumedCapacity')
    expect(result.ConsumedCapacity).toHaveProperty('CapacityUnits')
    expect(result.ConsumedCapacity).toHaveProperty('TableName')
})

it('should be able to retrieve user by user', async () => {
    const result = await usersProfilesResponseManager.handler(retrieveUserRequestByUser)
    expect(result).toHaveProperty('userId')
    expect(result).toHaveProperty('email')
    expect(result).toHaveProperty('clientId')
    expect(result).toHaveProperty('pilotTag')
    expect(result).toHaveProperty('active')
    expect(result).toHaveProperty('address')
    expect(result).toHaveProperty('budget')
    expect(result).toHaveProperty('announceNewFeature')
    expect(result).toHaveProperty('assessmentState')
    expect(result).toHaveProperty('department')
    expect(result).toHaveProperty('personalBudget')
    expect(result).toHaveProperty('companyBudget')
    expect(result).toHaveProperty('familyName')
    expect(result).toHaveProperty('givenName')
    expect(result).toHaveProperty('age')
    expect(result).toHaveProperty('pillars')
    expect(result).toHaveProperty('budgetSetup')
    expect(result.userId).toBe(USER_ID)
    expect(result.email).toBe(USER_EMAIL)
    expect(result.clientId).toBe(CLIENT_ID)
    expect(result.pilotTag).toBe(PILOT_TAG)
})


it('should be able to update user details by user', async () => {
    const result = await usersProfilesResponseManager.handler(updateUserRequestByUser)
    expect(result).toHaveProperty('Attributes')
    expect(result.Attributes).toHaveProperty('userId')
    expect(result.Attributes).toHaveProperty('email')
    expect(result.Attributes).toHaveProperty('clientId')
    expect(result.Attributes).toHaveProperty('pilotTag')
    expect(result.Attributes).toHaveProperty('age')
    expect(result.Attributes).toHaveProperty('familyName')
    expect(result.Attributes).toHaveProperty('givenName')
    expect(result.Attributes.userId).toBe(USER_ID)
    expect(result.Attributes.email).toBe(USER_EMAIL)
    expect(result.Attributes.clientId).toBe(CLIENT_ID)
    expect(result.Attributes.pilotTag).toBe(PILOT_TAG)
})

it('should be able to update user by admin', async () => {
    await expect(usersProfilesResponseManager.handler(updateUserRequestByAdmin)).rejects.toThrowError(`Admin trying to update the user profile: ${updateUserRequestByAdmin.params.Key.userId}. Action unauthorized.`)
})


it('should be able to update user budget by admin', async () => {
    await expect(usersProfilesResponseManager.handler(updateUserBudgetRequestByAdmin)).rejects.toThrowError(`Admin trying to update the user budget: ${updateUserBudgetRequestByAdmin.params.Key.userId}. Action unauthorized.`)
})

it('should be able to delet user', async () => {
    const result = await usersProfilesResponseManager.handler(deleteUserRequest)
    expect(result).toHaveProperty('Attributes')
    expect(result.Attributes).toHaveProperty('userId')
    expect(result.Attributes).toHaveProperty('email')
    expect(result.Attributes).toHaveProperty('clientId')
    expect(result.Attributes).toHaveProperty('pilotTag')
    expect(result.Attributes).toHaveProperty('age')
    expect(result.Attributes).toHaveProperty('familyName')
    expect(result.Attributes).toHaveProperty('givenName')
    expect(result.Attributes).toHaveProperty('personalBudget')
    expect(result.Attributes.userId).toBe(USER_ID)
    expect(result.Attributes.email).toBe(USER_EMAIL)
    expect(result.Attributes.clientId).toBe(CLIENT_ID)
    expect(result.Attributes.pilotTag).toBe(PILOT_TAG)
})

it('should be able to retrieve all users by admin', async () => {
    const result = await usersProfilesResponseManager.handler({ userType: 'admin', operation: 'retrieveAll' })
    for (let i = 0; i < result.length; i++) {
        expect(result[i]).toHaveProperty('userId')
    }
})

it('should be able to charge user by user', async () => {
    const result = await usersProfilesResponseManager.handler(chargeUserRequestByUser)
    expect(result).toHaveProperty('Attributes')
    expect(result.Attributes).toHaveProperty('budget')
    expect(result.Attributes).toHaveProperty('companyBudget')
    expect(result.Attributes).toHaveProperty('personalBudget')
})

it('should be able to charge user by admin', async () => {
    await expect(usersProfilesResponseManager.handler(chargeUserRequestByAdmin)).rejects.toThrowError(`Admin trying to update the user budget: ${chargeUserRequestByAdmin.userId}. Action unauthorized.`)
})

it('should be able to refund user by user', async () => {
    const result = await usersProfilesResponseManager.handler(refundUserRequestByUser)
    expect(result).toHaveProperty('Attributes')
    expect(result.Attributes).toHaveProperty('budget')
    expect(result.Attributes).toHaveProperty('companyBudget')
    expect(result.Attributes).toHaveProperty('personalBudget')
})

it('should be able to refund user by admin', async () => {
    await expect(usersProfilesResponseManager.handler(refundUserRequestByAdmin)).rejects.toThrowError(`Admin trying to update the user budget: ${refundUserRequestByAdmin.userId}. Action unauthorized.`)
})

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

const deleteClient = async () => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION })

    const deleteClient = {
        Key: {
            clientId: CLIENT_ID,
        },
        TableName: process.env.CLIENTS_TABLE_NAME,
    }

    await documentClient.delete(deleteClient)
        .promise()
        .then((data) => data)
        .catch((err) => err)
}

const deleteResource = async () => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION })

    const deleteResource = {
        Key: {
            resourceId: RESOURCE_ID,
        },
        TableName: process.env.DIRECTORY_TABLE_NAME,
    }

    await documentClient.delete(deleteResource)
        .promise()
        .then((data) => data)
        .catch((err) => err)
}

const deleteTransactions = async () => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION })

    let deleteTransaction

    for (let i = 0; i < 2; i++) {
        if (i === 0) {
            deleteTransaction = {
                Key: {
                    userId: USER_ID,
                    transactionId: TRANSACTION_ID_CONFIRMED,
                },
                TableName: process.env.TRANSACTIONS_TABLE_NAME,
            }
        }

        if (i === 1) {
            deleteTransaction = {
                Key: {
                    userId: USER_ID,
                    transactionId: TRANSACTION_ID_PENDING,
                },
                TableName: process.env.TRANSACTIONS_TABLE_NAME,
            }
        }
    }

    await documentClient.delete(deleteTransaction)
        .promise()
        .then((data) => data)
        .catch((err) => err)
}
