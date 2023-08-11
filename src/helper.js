const AWS = require('aws-sdk')
const { v1: uuidv1 } = require('uuid')
const moment = require('moment')
const bs = require('@thinkitiveltd')

const createUpdateExpression = (body, allowedToBeUpdatedAttributes) => {
    let UpdateExpression = 'set '

    Object.keys(body).forEach((key, index) => {
        if (allowedToBeUpdatedAttributes.includes(key)
        && body[key] !== undefined
        && body[key] !== ' '
        && body[key] !== '') {
            UpdateExpression += `#${key}=:${key}`

            if (index + 1 < Object.keys(body).length) {
                UpdateExpression += ','
            }
        }
    })

    if (UpdateExpression[UpdateExpression.length - 1] === ',') {
        UpdateExpression = UpdateExpression.substring(0, UpdateExpression.length - 1)
    }

    return UpdateExpression
}

const createExpressionAttributeNames = (body, allowedToBeUpdatedAttributes) => {
    const ExpressionAttributeNames = {}

    Object.keys(body).forEach((key) => {
        if (allowedToBeUpdatedAttributes.includes(key)
        && body[key] !== undefined
        && body[key] !== ' '
        && body[key] !== '') {
            ExpressionAttributeNames[`#${key}`] = key
        }
    })

    return ExpressionAttributeNames
}

const createExpressionAttributeValues = (body, allowedToBeUpdatedAttributes) => {
    const ExpressionAttributeValues = {}

    Object.keys(body).forEach((key) => {
        if (allowedToBeUpdatedAttributes.includes(key)
        && body[key] !== undefined
        && body[key] !== ' '
        && body[key] !== ''
        ) {
            ExpressionAttributeValues[`:${key}`] = body[key]
        }
    })

    return ExpressionAttributeValues
}

const updateUser = async (event) => {
    const allowedToBeUpdatedAttributes = [
        'address',
        'age',
        'postcode',
        'gender',
        'pillars',
        'assessmentState',
        'familyName',
        'givenName',
        'announceNewFeature',
        'locale',
    ]

    const { body } = event

    const UpdateExpression = createUpdateExpression(body, allowedToBeUpdatedAttributes)

    const ExpressionAttributeNames = createExpressionAttributeNames(
        body,
        allowedToBeUpdatedAttributes,
    )
    const ExpressionAttributeValues = createExpressionAttributeValues(
        body,
        allowedToBeUpdatedAttributes,
    )

    const params = {
        TableName: process.env.USERS_PROFILES_TABLE_NAME,
        Key: { userId: event.userId },
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ReturnValues: 'ALL_NEW',
    }
    const docClient = new AWS.DynamoDB.DocumentClient()

    return docClient.update(params)
        .promise()
        .then((user) => user)
        .catch((err) => {
            console.log(`Unable to update the userProfile ${event.userId}`, err)
            console.log('Params ', params)

            throw new Error(`Unable to update the userProfile ${event.userId}`)
        })
}

const addUserToUsersProfiles = async (userId) => {
    const pillars = [
        {
            Exercise: {
                tags: [],
                value: 5,
            },
            HelpingOthers: {
                tags: [],
                value: 5,
            },
            LifeSatisfaction: {
                tags: [],
                value: 5,
            },
            MeaningfulActivity: {
                tags: [],
                value: 5,
            },
            PositiveEmployer: {
                tags: [],
                value: 5,
            },
            Sleep: {
                tags: [],
                value: 5,
            },
            SocialConnections: {
                tags: [],
                value: 5,
            },
            StressManagement: {
                tags: [],
                value: 5,
            },
        },
    ]

    const UpdateExpression = 'set #assessmentUpdateState=:assessmentUpdateState, #privacyPolicyRead=:privacyPolicyRead, #budget=:budget, #assessmentState=:assessmentState, #companyBudget=:companyBudget, #personalBudget=:personalBudget, #announceNewFeature=:announceNewFeature, #pillars=:pillars REMOVE address, favouriteResources, locale.currency'

    const ExpressionAttributeNames = {
        '#privacyPolicyRead': 'privacyPolicyRead',
        '#assessmentUpdateState': 'assessmentUpdateState',
        '#assessmentState': 'assessmentState',
        '#budget': 'budget',
        '#personalBudget': 'personalBudget',
        '#companyBudget': 'companyBudget',
        '#announceNewFeature': 'announceNewFeature',
        '#pillars': 'pillars',
    }

    const ExpressionAttributeValues = {
        ':assessmentState': false,
        ':assessmentUpdateState': 'NTNU',
        ':budget': 0,
        ':companyBudget': 0,
        ':personalBudget': 0,
        ':privacyPolicyRead': false,
        ':announceNewFeature': true,
        ':pillars': pillars,
        // ':favouriteResources': docClient.createSet([' ']),
    }

    const params = {
        TableName: process.env.USERS_PROFILES_TABLE_NAME,
        Key: {
            userId,
        },
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ReturnValues: 'UPDATED_NEW',
    }
    const docClient = new AWS.DynamoDB.DocumentClient()

    return docClient.update(params)
        .promise()
        .then((data) => data)
        .catch((err) => {
            console.log('Unable to update the usersProfiles Table.', err)
            console.log('Params ', params)

            throw new Error('Unable to update the usersProfiles Table.')
        })
}

const updateAssessmentUpdateState = async (userId) => {
    const UpdateExpression = 'set #assessmentUpdateState=:assessmentUpdateState'

    const ExpressionAttributeNames = {
        '#assessmentUpdateState': 'assessmentUpdateState',
    }

    const ExpressionAttributeValues = {
        ':assessmentUpdateState': 'TNU',
    }

    const params = {
        TableName: process.env.USERS_PROFILES_TABLE_NAME,
        Key: { userId },
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ReturnValues: 'UPDATED_NEW',
    }
    const docClient = new AWS.DynamoDB.DocumentClient()

    return docClient.update(params)
        .promise()
        .then((data) => {
            console.log('user updated successfully !', data)
            return data
        })
        .catch((err) => {
            console.log('Unable to update the usersProfiles Table.', err)
            console.log('Params ', params)

            throw new Error('Unable to update the usersProfiles Table.')
        })
}

const depletingBudgetFromUsersProfiles = async (event) => {
    console.log('start depleting budget from users profiles...')

    const { body, userId } = event
    const { price, personalSpent, companySpent } = body

    const params = {
        TableName: process.env.USERS_PROFILES_TABLE_NAME,
        Key: { userId },
        UpdateExpression: 'ADD #budget :budget, #personalBudget :personalBudget, #companyBudget :companyBudget',
        ExpressionAttributeNames: {
            '#budget': 'budget',
            '#companyBudget': 'companyBudget',
            '#personalBudget': 'personalBudget',
        },
        ExpressionAttributeValues: {
            ':budget': -Number(price),
            ':companyBudget': -Number(companySpent),
            ':personalBudget': -Number(personalSpent),
        },
        ReturnValues: 'UPDATED_NEW',
    }
    const docClient = new AWS.DynamoDB.DocumentClient()

    return docClient.update(params)
        .promise()
        .then((user) => {
            console.log('User charged', user)

            return user
        })
        .catch((err) => {
            console.log(`Unable to update the user budget ${event.userId}`, err)
            console.log('Params ', params)

            throw new Error(`Unable to update the user budget ${event.userId}`)
        })
}

const refundBudgetToUsersProfiles = async (event) => {
    const { body, userId } = event
    const { price, personalBudget, companyBudget } = body

    const params = {
        TableName: process.env.USERS_PROFILES_TABLE_NAME,
        Key: { userId },
        UpdateExpression: 'ADD #budget :budget, #personalBudget :personalBudget, #companyBudget :companyBudget',
        ExpressionAttributeNames: {
            '#budget': 'budget',
            '#companyBudget': 'companyBudget',
            '#personalBudget': 'personalBudget',
        },
        ExpressionAttributeValues: {
            ':budget': Number(price),
            ':companyBudget': Number(companyBudget),
            ':personalBudget': Number(personalBudget),
        },
        ReturnValues: 'UPDATED_NEW',
    }
    const docClient = new AWS.DynamoDB.DocumentClient()

    return docClient.update(params)
        .promise()
        .then((user) => user)
        .catch((err) => {
            console.log(`Unable to update the user budget ${event.userId}`, err)
            console.log('Params ', params)

            throw new Error(`Unable to update the user budget ${event.userId}`)
        })
}

const updateUserBudget = async (event) => {
    const docClient = new AWS.DynamoDB.DocumentClient()

    const { body, userId } = event
    const { amount, paymentIntent } = body

    const params = {
        TableName: process.env.USERS_PROFILES_TABLE_NAME,
        Key: { userId },
        UpdateExpression: 'ADD #budget :budget, #addedBudget :addedBudget, #personalBudget :personalBudget, #paymentIntentIds :paymentIntentIds',
        ExpressionAttributeNames: {
            '#budget': 'budget',
            '#addedBudget': 'addedBudget',
            '#personalBudget': 'personalBudget',
            '#paymentIntentIds': 'paymentIntentIds',
        },
        ExpressionAttributeValues: {
            ':budget': Number(amount),
            ':addedBudget': Number(amount),
            ':personalBudget': Number(amount),
            ':paymentIntentIds': docClient.createSet([paymentIntent.id]),
        },
        ReturnValues: 'UPDATED_NEW',
    }

    return docClient.update(params)
        .promise()
        .then((user) => user)
        .catch((err) => {
            console.log(`Unable to update the user budget ${event.userId}`, err)
            console.log('Params ', params)

            throw new Error(`Unable to update the user budget ${event.userId}`)
        })
}

const getRecords = async (userId, TableName) => {
    const params = {
        TableName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId },
    }
    const docClient = new AWS.DynamoDB.DocumentClient()

    return docClient.query(params)
        .promise()
        .then((data) => data)
        .catch((err) => {
            console.log('Error occurred', err)
            console.log('params ', params)

            throw new Error('Error occurred')
        })
}

const createUserProfileChange = async (userRecord, action, previousValue) => {
    const params = {
        TableName: process.env.USERS_PROFILES_CHANGES_TABLE_NAME,
        Item: {
            clientId: userRecord.clientId.S,
            changeId: `chang_${uuidv1()}`,
            userId: userRecord.userId.S,
            firstName: userRecord.givenName.S,
            lastName: userRecord.familyName.S,
            previousValue: previousValue || null,
            changedBy: previousValue ? 'admin' : 'user',
            from: null,
            action,
            date: moment().format(),
        },
        ReturnConsumedCapacity: 'TOTAL',
        ReturnItemCollectionMetrics: 'SIZE',
        ReturnValues: 'ALL_OLD',
    }
    const docClient = new AWS.DynamoDB.DocumentClient()

    return docClient.put(params)
        .promise()
        .then((user) => user)
        .catch((err) => {
            console.log(`Error creating user change ${userRecord.userId.S}`, err)
            console.log('Params ', params)

            throw new Error(`Error creating user change ${userRecord.userId.S}`)
        })
}

const updateClientProfile = async (clientId) => {
    const params = {
        TableName: process.env.CLIENTS_TABLE_NAME,
        Key: { clientId },
        UpdateExpression: 'ADD signedUpCount :signedUpCount',
        ExpressionAttributeValues: {
            ':signedUpCount': 1,
        },
    }
    const docClient = new AWS.DynamoDB.DocumentClient()

    return docClient.update(params)
        .promise()
        .then((result) => result)
        .catch((error) => {
            console.log('Error updating client profile', error)
            console.log('Params ', params)

            throw Error('Error updating client profile')
        })
}

const updateClientProfileUsersCount = async (deactivatedUsers, clientId) => {
    const params = {
        TableName: process.env.CLIENTS_TABLE_NAME,
        Key: { clientId },
        UpdateExpression: 'ADD #deactivatedUsers :deactivatedUsers, #signedUpCount :signedUpCount',
        ExpressionAttributeNames: {
            '#deactivatedUsers': 'deactivatedUsers',
            '#signedUpCount': 'signedUpCount',
        },
        ExpressionAttributeValues: {
            ':deactivatedUsers': deactivatedUsers,
            ':signedUpCount': -deactivatedUsers,
        },
    }
    const docClient = new AWS.DynamoDB.DocumentClient()

    return docClient.update(params)
        .promise()
        .then((data) => data)
        .catch((err) => {
            console.log('Error updating user profile')
            console.log('Params ', params)

            throw Error('Error updating user profile', err)
        })
}

const sendInvitationEmail = async (
    invitation,
) => {
    const {
        email,
        name,
        pilotTag,
        invitationCode,
    } = invitation
    console.log('entred send invitation email ...')

    const ses = new AWS.SES({ region: 'ap-south-1' })

    const styles = {
        p: 'margin: 0 0 16px 0; padding: 0;',
    }

    const subject = 'Think Signup Invitation'

    let url
    if (process.env.STAGE_NAME === 'demo') url = 'https://demo-user.think.com/'
    if (process.env.STAGE_NAME === 'prod') url = 'https://app.think.com/'
    if (process.env.STAGE_NAME === 'stg') url = 'https://stg-user.think.com/'
    if (process.env.STAGE_NAME === 'dev') url = 'https://dev-user.think.com/'
    console.log('url ', url)

    const body = `<p style=${styles.p}>Hi ${name || ''},</p>
        <p style=${styles.p}>Welcome to <strong>Think!</strong> ${pilotTag} are providing you with access to our wellbeing platform, and we are really looking forward to you joining. </p>
        <p style=${styles.p}>Click this unique link and please follow the steps carefully for signing up: </p>
        <p style=${styles.p}><a href="${url}signup?invitationCode=${invitationCode}">${url}signup?invitationCode=${invitationCode}</a></p>
        <p style=${styles.p}>If you have any questions, please reply directly to this email.</p>
        <p style=${styles.p}>Best Wishes,<br>Team Think</p>`

    const eParams = {
        Destination: { ToAddresses: [email] },
        Message: {
            Body: {
                Html: {
                    Data: body,
                    Charset: 'UTF-8',
                },
            },
            Subject: { Data: subject },
        },
        Source: 'support@think.com',
    }
    const emailSent = new Promise((resolve, reject) => {
        ses.sendEmail(eParams, (err, data) => {
            if (err) {
                console.log('Error in sending the email ', err)
                reject(err, 'Error in sending the email:')
            } else {
                console.log('ePrams ', eParams)
                console.log('Email sent ', data)
                resolve(data)
            }
        })
    })

    console.log('email sent ', emailSent)

    return emailSent
}

const getInvitation = async (key, attribute) => {
    let data = null
    if (attribute === 'invitationCode') {
        data = await bs.getEmployeeRecordByInvitationCode(key)
    }
    if (attribute === 'email') {
        data = await bs.getEmployeeRecordByEmail(key)
    }
    return data
}

const createGoal = async (body, userProfile, didntHadGoalCreated) => {
    const params = {
        TableName: process.env.USER_GOALS_TABLE_NAME,
        Item: {
            goalId: uuidv1(),
            userId: userProfile.userId,
            clientId: userProfile.clientId,
            goalTag: body.goalTag,
            reached: body.goalReached,
            isForSomebodyElse: body.isForSomebodyElse,
            rating: body.goalRating,
            comment: body.goalComment,
            weight: body.weight,
            createdAt: didntHadGoalCreated ? userProfile.assessmentDate : moment().format(),
            updatedAt: didntHadGoalCreated ? moment().format() : undefined,
        },
    }
    const docClient = new AWS.DynamoDB.DocumentClient()

    return docClient.put(params)
        .promise()
        .then((data) => data)
        .catch((err) => {
            console.log('Error creating goal', err)
            console.log('Params', params)

            throw Error('Error creating goal')
        })
}

const updateUserProfilePillars = async (userId, newPillarsObject) => {
    const params = {
        TableName: process.env.USERS_PROFILES_TABLE_NAME,
        Key: { userId },
        UpdateExpression: 'set #pillars = :pillars',
        ExpressionAttributeNames: {
            '#pillars': 'pillars',
        },
        ExpressionAttributeValues: {
            ':pillars': newPillarsObject,
        },
    }

    const docClient = new AWS.DynamoDB.DocumentClient()

    return docClient.update(params)
        .promise()
        .then((data) => data)
        .catch((err) => {
            console.log('Error updating user profile pillars', err)
            console.log('params', params)

            throw Error('Error updating user profile pillars')
        })
}

const getNewPillarsObject = (pillars, body, isGoalAddition) => {
    const userProfilePillars = {
        ...pillars,
    }
    if (isGoalAddition) {
        console.log('Add', userProfilePillars[body.pillarName])
        if (pillars[body.pillarName].tags.includes(body.goalTag)) {
            throw Error('Goal already exists')
        }
        userProfilePillars[body.pillarName].tags = [
            ...pillars[body.pillarName].tags,
            body.goalTag,
        ]
    } else {
        console.log('pillars[body.pillarName].tags ', pillars[body.pillarName].tags)

        const newTags = []

        for (let i = 0; i < pillars[body.pillarName].tags.length; i++) {
            if (body.goalTag !== pillars[body.pillarName].tags[i]) {
                newTags.push(pillars[body.pillarName].tags[i])
            }
        }

        console.log('newTags ', newTags)

        userProfilePillars[body.pillarName].tags = newTags
    }

    console.log('userProfilePillars ', userProfilePillars)

    return [
        userProfilePillars,
    ]
}

const updateGoal = async (goal, body) => {
    const params = {
        TableName: process.env.USER_GOALS_TABLE_NAME,
        Key: { goalId: goal.goalId },
        UpdateExpression: 'set #reached = :reached, #updatedAt = :updatedAt, #comment = :comment, #rating = :rating',
        ExpressionAttributeNames: {
            '#reached': 'reached',
            '#updatedAt': 'updatedAt',
            '#rating': 'rating',
            '#comment': 'comment',
        },
        ExpressionAttributeValues: {
            ':reached': body.goalReached,
            ':rating': body.goalRating,
            ':comment': body.goalComment,
            ':updatedAt': moment().format(),
        },
    }

    const docClient = new AWS.DynamoDB.DocumentClient()

    return docClient.update(params)
        .promise()
        .then((data) => data)
        .catch((err) => {
            console.log('Error updating goal', err)
            console.log('params', params)

            throw Error('Error updating goal')
        })
}

const batchDeleteRecords = async (chunkedArray, tableName) => {
    for (let i = 0; i < chunkedArray.length; i++) {
        const RequestItems = {}
        RequestItems[tableName] = chunkedArray[i]
        const params = {
            RequestItems,
        }

        const docClient = new AWS.DynamoDB.DocumentClient()

        // eslint-disable-next-line no-await-in-loop
        await docClient
            .batchWrite(params)
            .promise()
            .then((data) => data.Items)
            .catch((err) => {
                console.log('Error deleting records', err)
                console.log('Params', RequestItems)

                throw Error('Error deleting records')
            })
    }

    return 0
}

const updateUserStatus = async (userId, isActive) => {
    console.log('Start updating user status...')

    const params = {
        TableName: process.env.USERS_PROFILES_TABLE_NAME,
        Key: { userId },
        UpdateExpression: 'set #active=:active',
        ExpressionAttributeNames: {
            '#active': 'active',
        },
        ExpressionAttributeValues: {
            ':active': isActive,
        },
    }

    console.log('params ', params)
    const documentClient = new AWS.DynamoDB.DocumentClient()

    return documentClient
        .update(params)
        .promise()
        .then((data) => {
            console.log('User ', data)
            return data
        })
        .catch((err) => {
            console.log('Error updating user.', err)
            throw new Error('Error updating user')
        })
}

const getUserByUserId = async (userId) => {
    const params = {
        TableName: process.env.USERS_PROFILES_TABLE_NAME,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId },
    }

    const docClient = new AWS.DynamoDB.DocumentClient()

    return docClient.query(params)
        .promise()
        .then((result) => result.Items[0])
        .catch((err) => {
            console.log('Error querying user', err)
            console.log('Params ', params)
            throw Error('Error querying user')
        })
}

const getEmployeeFromEmployeesDetails = async (email) => {
    const params = {
        TableName: process.env.EMPLOYEES_DETAILS_TABLE_NAME,
        IndexName: 'email-index',
        KeyConditionExpression: '#email = :email',
        ExpressionAttributeNames: { '#email': 'email' },
        ExpressionAttributeValues: {
            ':email': email,
        },
    }

    const docClient = new AWS.DynamoDB.DocumentClient()

    return docClient.query(params)
        .promise()
        .then((result) => result.Items[0])
        .catch((error) => {
            console.log('Error getting the employee details', error)
            console.log('Params ', params)
            throw Error('Error getting the employee details')
        })
}

const updateEmployeesWhitelistState = async (employeeId, state, updatedBy) => {
    const disabledAt = state === 'DISABLED' ? moment().format() : null

    const params = {
        TableName: process.env.EMPLOYEES_DETAILS_TABLE_NAME,
        Key: { employeeId },
        UpdateExpression: 'set #state=:state, #updatedBy=:updatedBy, #disabledAt=:disabledAt, #updatedAt=:updatedAt',
        ExpressionAttributeNames: {
            '#state': 'state',
            '#updatedBy': 'updatedBy',
            '#disabledAt': 'disabledAt',
            '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
            ':state': state,
            ':updatedBy': updatedBy,
            ':disabledAt': disabledAt,
            ':updatedAt': moment().format(),
        },
    }

    const documentClient = new AWS.DynamoDB.DocumentClient()

    return documentClient.update(params)
        .promise()
        .then((data) => data)
        .catch((err) => {
            console.log('params ', params)
            console.log('Error updating email.', err)

            throw new Error('Error updating email')
        })
}

const changeCognitoUserState = async (employee, isActive) => {
    // disable employee on cognito if it exists
    if (employee.userId) {
        const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' })

        if (isActive) {
            return cognitoidentityserviceprovider.adminEnableUser({
                UserPoolId: process.env.UserPoolId, /* required */
                Username: employee.userId, /* required */
            }, (err, data) => {
                if (err) console.log(err, err.stack) // an error occurred
                else console.log(data) // successful response
            })
        }

        return cognitoidentityserviceprovider.adminDisableUser({
            UserPoolId: process.env.UserPoolId, /* required */
            Username: employee.userId, /* required */
        }, (err, data) => {
            if (err) console.log(err, err.stack) // an error occurred
            else console.log(data) // successful response
        })
    }

    throw new Error('Employee does not have a userId')
}

const validateInputForFavouriteResource = async (event) => {
    if (event.userId === undefined || event.userId === null) {
        throw new Error('User id does not exist in the payload')
    }

    if (event.body.resourceId === undefined || event.body.resourceId === null) {
        throw new Error('Resource id does not exist in the payload')
    }
}

const saveFavouriteResourceIdInUserProfile = async (event) => {
    const docClient = new AWS.DynamoDB.DocumentClient()

    const params = {
        TableName: process.env.USERS_PROFILES_TABLE_NAME,
        Key: { userId: event.userId },
        UpdateExpression: 'ADD #favouriteResources :favouriteResources',
        ExpressionAttributeNames: { '#favouriteResources': 'favouriteResources' },
        ExpressionAttributeValues: {
            ':favouriteResources': docClient.createSet([event.body.resourceId]),
        },
        ReturnValues: 'UPDATED_NEW',
    }

    return docClient.update(params)
        .promise()
        .then((result) => result)
        .catch((error) => {
            console.log('Error updating favourite resource id in the user profile', error)
            console.log('Params ', params)

            throw Error('Error updating favourite resource id in the user profile')
        })
}

const removeFavouriteResourceIdFromUserProfile = async (event) => {
    const docClient = new AWS.DynamoDB.DocumentClient()

    const params = {
        TableName: process.env.USERS_PROFILES_TABLE_NAME,
        Key: { userId: event.userId },
        UpdateExpression: 'DELETE #favouriteResources :favouriteResources',
        ExpressionAttributeNames: { '#favouriteResources': 'favouriteResources' },
        ExpressionAttributeValues: {
            ':favouriteResources': docClient.createSet([event.body.resourceId]),
        },
        ReturnValues: 'UPDATED_NEW',
    }

    return docClient.update(params)
        .promise()
        .then((result) => result)
        .catch((error) => {
            console.log('Error removing favourite resource id from the user profile', error)
            console.log('Params ', params)

            throw Error('Error removing favourite resource id from the user profile')
        })
}

module.exports = {
    updateUser,
    depletingBudgetFromUsersProfiles,
    refundBudgetToUsersProfiles,
    addUserToUsersProfiles,
    updateUserBudget,
    getRecords,
    createUserProfileChange,
    updateClientProfile,
    updateAssessmentUpdateState,
    getInvitation,
    sendInvitationEmail,
    updateUserProfilePillars,
    createGoal,
    getNewPillarsObject,
    updateGoal,
    batchDeleteRecords,
    validateInputForFavouriteResource,
    updateClientProfileUsersCount,
    updateUserStatus,
    getUserByUserId,
    getEmployeeFromEmployeesDetails,
    updateEmployeesWhitelistState,
    changeCognitoUserState,
    saveFavouriteResourceIdInUserProfile,
    removeFavouriteResourceIdFromUserProfile,
}
