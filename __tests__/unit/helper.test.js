const AWS = require('aws-sdk')
const helper = require('../../src/helper')

const updateUserRequest = require('../jsons/updateUserRequest.json')
const updateUserExpectedResponse = require('../jsons/updateUserExpectedResponse.json')
const addUserToUsersProfilesExpectedResponse = require('../jsons/addUserToUsersProfilesExpectedResponse.json')
const updateAssessmentUpdateStateExpectedResponse = require('../jsons/updateAssessmentUpdateStateExpectedResponse.json')
const depletingBudgetFromUsersProfilesRequest = require('../jsons/depletingBudgetFromUsersProfilesRequest.json')
const depletingBudgetFromUsersProfilesExpectedResponse = require('../jsons/depletingBudgetFromUsersProfilesExpectedResponse.json')
const refundBudgetToUsersProfilesRequest = require('../jsons/refundBudgetToUsersProfilesRequest.json')
const refundBudgetToUsersProfilesExpectedResponse = require('../jsons/refundBudgetToUsersProfilesExpectedResponse.json')
const createUserProfileChangeRequest = require('../jsons/createUserProfileChangeRequest.json')
const createUserProfileChangeExpectedResponse = require('../jsons/createUserProfileChangeExpectedResponse.json')
const updateClientProfileExpectedResponse = require('../jsons/updateClientProfileExpectedResponse.json')
const updateClientProfileUsersCountExpectedResponse = require('../jsons/updateClientProfileUsersCountExpectedResponse.json')
const createGoalRequest = require('../jsons/createGoalRequest.json')

jest.mock('aws-sdk', () => {
    const mDocumentClient = {
        // eslint-disable-next-line max-len
        put: jest.fn(), query: jest.fn(), scan: jest.fn(), update: jest.fn(), delete: jest.fn(), createSet: jest.fn(),
    }
    const mDynamoDB = { DocumentClient: jest.fn(() => mDocumentClient) }

    return {
        DynamoDB: mDynamoDB,
    }
})

const mDynamoDb = new AWS.DynamoDB.DocumentClient()


describe('updateUser', () => {
    test('should be able to handle network error', async () => {
        const mError = new Error('network')

        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.reject(mError)
            },
        }))

        await expect(helper.updateUser(updateUserRequest)).rejects.toThrowError(`Unable to update the userProfile ${updateUserRequest.userId}`)
        expect(mDynamoDb.update).toHaveBeenCalled()
    })

    test('should be able to updateUser', async () => {
        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.resolve(updateUserExpectedResponse)
            },
        }))

        // eslint-disable-next-line max-len
        await expect(helper.updateUser(updateUserRequest)).resolves.toEqual(updateUserExpectedResponse)
        expect(mDynamoDb.update).toHaveBeenCalled()
    })
})

describe('addUserToUsersProfiles', () => {
    test('should be able to handle network error', async () => {
        const mError = new Error('network')

        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.reject(mError)
            },
        }))

        await expect(helper.addUserToUsersProfiles(USER_ID)).rejects.toThrowError('Unable to update the usersProfiles Table.')
        expect(mDynamoDb.update).toHaveBeenCalled()
    })

    test('should be able to addUserToUsersProfiles', async () => {
        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.resolve(addUserToUsersProfilesExpectedResponse)
            },
        }))

        // eslint-disable-next-line max-len
        await expect(helper.addUserToUsersProfiles(USER_ID)).resolves.toEqual(addUserToUsersProfilesExpectedResponse)
        expect(mDynamoDb.update).toHaveBeenCalled()
    })
})

describe('updateAssessmentUpdateState', () => {
    test('should be able to handle network error', async () => {
        const mError = new Error('network')

        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.reject(mError)
            },
        }))

        await expect(helper.updateAssessmentUpdateState(USER_ID)).rejects.toThrowError('Unable to update the usersProfiles Table.')
        expect(mDynamoDb.update).toHaveBeenCalled()
    })

    test('should be able to updateAssessmentUpdateState', async () => {
        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.resolve(updateAssessmentUpdateStateExpectedResponse)
            },
        }))

        // eslint-disable-next-line max-len
        await expect(helper.updateAssessmentUpdateState(USER_ID)).resolves.toEqual(updateAssessmentUpdateStateExpectedResponse)
        expect(mDynamoDb.update).toHaveBeenCalled()
    })
})

describe('depletingBudgetFromUsersProfiles', () => {
    test('should be able to handle network error', async () => {
        const mError = new Error('network')

        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.reject(mError)
            },
        }))

        await expect(helper.depletingBudgetFromUsersProfiles(depletingBudgetFromUsersProfilesRequest)).rejects.toThrowError(`Unable to update the user budget ${depletingBudgetFromUsersProfilesRequest.userId}`)
        expect(mDynamoDb.update).toHaveBeenCalled()
    })

    test('should be able to depletingBudgetFromUsersProfiles', async () => {
        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.resolve(depletingBudgetFromUsersProfilesExpectedResponse)
            },
        }))

        // eslint-disable-next-line max-len
        await expect(helper.depletingBudgetFromUsersProfiles(depletingBudgetFromUsersProfilesRequest)).resolves.toEqual(depletingBudgetFromUsersProfilesExpectedResponse)
        expect(mDynamoDb.update).toHaveBeenCalled()
    })
})

describe('refundBudgetToUsersProfiles', () => {
    test('should be able to handle network error', async () => {
        const mError = new Error('network')

        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.reject(mError)
            },
        }))

        await expect(helper.refundBudgetToUsersProfiles(refundBudgetToUsersProfilesRequest)).rejects.toThrowError(`Unable to update the user budget ${refundBudgetToUsersProfilesRequest.userId}`)
        expect(mDynamoDb.update).toHaveBeenCalled()
    })

    test('should be able to refundBudgetToUsersProfiles', async () => {
        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.resolve(refundBudgetToUsersProfilesExpectedResponse)
            },
        }))

        // eslint-disable-next-line max-len
        await expect(helper.refundBudgetToUsersProfiles(refundBudgetToUsersProfilesRequest)).resolves.toEqual(refundBudgetToUsersProfilesExpectedResponse)
        expect(mDynamoDb.update).toHaveBeenCalled()
    })
})

describe('updateUserBudget', () => {
    test('should be able to handle network error', async () => {
        const mError = new Error('network')

        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.reject(mError)
            },
        }))

        await expect(helper.updateUserBudget(updateUserBudgetRequest)).rejects.toThrowError(`Unable to update the user budget ${updateUserBudgetRequest.userId}`)
        expect(mDynamoDb.update).toHaveBeenCalled()
    })

    test('should be able to updateUserBudget', async () => {
        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.resolve(updateUserBudgetExpectedResponse)
            },
        }))

        // eslint-disable-next-line max-len
        await expect(helper.updateUserBudget(updateUserBudgetRequest)).resolves.toEqual(updateUserBudgetExpectedResponse)
        expect(mDynamoDb.update).toHaveBeenCalled()
    })
})

describe('createUserProfileChange', () => {
    test('should be able to handle network error', async () => {
        const mError = new Error('network')

        mDynamoDb.put.mockImplementation(() => ({
            promise() {
                return Promise.reject(mError)
            },
        }))

        await expect(helper.createUserProfileChange(createUserProfileChangeRequest)).rejects.toThrowError(`Error creating user change ${createUserProfileChangeRequest.userId.S}`)
        expect(mDynamoDb.put).toHaveBeenCalled()
    })

    test('should be able to createUserProfileChange', async () => {
        mDynamoDb.put.mockImplementation(() => ({
            promise() {
                return Promise.resolve(createUserProfileChangeExpectedResponse)
            },
        }))

        // eslint-disable-next-line max-len
        await expect(helper.createUserProfileChange(createUserProfileChangeRequest)).resolves.toEqual(createUserProfileChangeExpectedResponse)
        expect(mDynamoDb.put).toHaveBeenCalled()
    })
})

describe('updateClientProfile', () => {
    test('should be able to handle network error', async () => {
        const mError = new Error('network')

        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.reject(mError)
            },
        }))

        await expect(helper.updateClientProfile(CLIENT_ID)).rejects.toThrowError('Error updating client profile')
        expect(mDynamoDb.update).toHaveBeenCalled()
    })

    test('should be able to updateClientProfile', async () => {
        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.resolve(updateClientProfileExpectedResponse)
            },
        }))

        // eslint-disable-next-line max-len
        await expect(helper.updateClientProfile(CLIENT_ID)).resolves.toEqual(updateClientProfileExpectedResponse)
        expect(mDynamoDb.update).toHaveBeenCalled()
    })
})

describe('updateClientProfileUsersCount', () => {
    test('should be able to handle network error', async () => {
        const mError = new Error('network')

        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.reject(mError)
            },
        }))

        await expect(helper.updateClientProfileUsersCount(5, CLIENT_ID)).rejects.toThrowError('Error updating user profile')
        expect(mDynamoDb.update).toHaveBeenCalled()
    })

    test('should be able to updateClientProfileUsersCount', async () => {
        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.resolve(updateClientProfileUsersCountExpectedResponse)
            },
        }))

        // eslint-disable-next-line max-len
        await expect(helper.updateClientProfileUsersCount(5, CLIENT_ID)).resolves.toEqual(updateClientProfileUsersCountExpectedResponse)
        expect(mDynamoDb.update).toHaveBeenCalled()
    })
})

describe('createGoal', () => {
    test('should be able to handle network error', async () => {
        const mError = new Error('network')

        mDynamoDb.put.mockImplementation(() => ({
            promise() {
                return Promise.reject(mError)
            },
        }))

        await expect(helper.createGoal(createGoalRequest.body, createGoalRequest.userProfile, createGoalRequest.didntHadGoalCreated)).rejects.toThrowError('Error creating goal')
        expect(mDynamoDb.put).toHaveBeenCalled()
    })

    test('should be able to createGoal', async () => {
        mDynamoDb.put.mockImplementation(() => ({
            promise() {
                return Promise.resolve(createGoalExpectedResponse)
            },
        }))

        // eslint-disable-next-line max-len
        await expect(helper.createGoal(createGoalRequest.body, createGoalRequest.userProfile, createGoalRequest.didntHadGoalCreated)).resolves.toEqual(createGoalExpectedResponse)
        expect(mDynamoDb.put).toHaveBeenCalled()
    })
})

describe('updateUserProfilePillars', () => {
    test('should be able to handle network error', async () => {
        const mError = new Error('network')

        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.reject(mError)
            },
        }))

        await expect(helper.updateUserProfilePillars(updateUserProfilePillarsRequest)).rejects.toThrowError('Error updating user profile pillars')
        expect(mDynamoDb.update).toHaveBeenCalled()
    })

    test('should be able to updateUserProfilePillars', async () => {
        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.resolve(updateUserProfilePillarsExpectedResponse)
            },
        }))

        // eslint-disable-next-line max-len
        await expect(helper.updateUserProfilePillars(updateUserProfilePillarsRequest)).resolves.toEqual(updateUserProfilePillarsExpectedResponse)
        expect(mDynamoDb.update).toHaveBeenCalled()
    })
})

describe('updateGoal', () => {
    test('should be able to handle network error', async () => {
        const mError = new Error('network')

        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.reject(mError)
            },
        }))

        await expect(helper.updateGoal(updateGoalRequest.goal, updateGoalRequest.body)).rejects.toThrowError('Error updating goal')
        expect(mDynamoDb.update).toHaveBeenCalled()
    })

    test('should be able to updateGoal', async () => {
        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.resolve(updateGoalExpectedResponse)
            },
        }))

        // eslint-disable-next-line max-len
        await expect(helper.updateGoal(updateGoalRequest.goal, updateGoalRequest.body)).resolves.toEqual(updateGoalExpectedResponse)
        expect(mDynamoDb.update).toHaveBeenCalled()
    })
})

describe('saveFavouriteResourceIdInUserProfile', () => {
    test('should be able to handle network error', async () => {
        const mError = new Error('network')

        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.reject(mError)
            },
        }))

        await expect(helper.saveFavouriteResourceIdInUserProfile(saveFavouriteResourceIdInUserProfileRequest)).rejects.toThrowError('Error updating favourite resource id in the user profile')
        expect(mDynamoDb.update).toHaveBeenCalled()
    })

    test('should be able to saveFavouriteResourceIdInUserProfile', async () => {
        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.resolve(saveFavouriteResourceIdInUserProfileExpectedResponse)
            },
        }))

        // eslint-disable-next-line max-len
        await expect(helper.saveFavouriteResourceIdInUserProfile(saveFavouriteResourceIdInUserProfileRequest)).resolves.toEqual(saveFavouriteResourceIdInUserProfileExpectedResponse)
        expect(mDynamoDb.update).toHaveBeenCalled()
    })
})

describe('removeFavouriteResourceIdFromUserProfile', () => {
    test('should be able to handle network error', async () => {
        const mError = new Error('network')

        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.reject(mError)
            },
        }))

        await expect(helper.removeFavouriteResourceIdFromUserProfile(saveFavouriteResourceIdInUserProfileRequest)).rejects.toThrowError('Error removing favourite resource id from the user profile')
        expect(mDynamoDb.update).toHaveBeenCalled()
    })

    test('should be able to removeFavouriteResourceIdFromUserProfile', async () => {
        mDynamoDb.update.mockImplementation(() => ({
            promise() {
                return Promise.resolve(saveFavouriteResourceIdInUserProfileExpectedResponse)
            },
        }))

        // eslint-disable-next-line max-len
        await expect(helper.removeFavouriteResourceIdFromUserProfile(removeFavouriteResourceIdFromUserProfileRequest)).resolves.toEqual(removeFavouriteResourceIdFromUserProfileExpectedResponse)
        expect(mDynamoDb.update).toHaveBeenCalled()
    })
})
