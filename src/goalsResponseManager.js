const ts = require('@thinkitiveltd/thinkitive')
// eslint-disable-next-line camelcase
const ts_util = require('@thinkitiveltd/thinkitive/utils')

const {
    USER_TYPES,
} = require('@thinkitiveltd/thinkitive/constants')

const {
    createGoal,
    getNewPillarsObject,
    updateUserProfilePillars,
    updateGoal,
} = require('./helper')

const {
    OPERATIONS,
} = require('./constants')

exports.handler = async (event, context) => {
    console.log('Event:', JSON.stringify(event, null, 2))
    console.log('Context:', JSON.stringify(context, null, 2))

    switch (event.operation) {
    case OPERATIONS.DELETE: {
        const deleteGoal = await goalDelete(event)
        return {
            message: 'The goal was successfully deleted',
            payload: {
                data: deleteGoal.Attributes,
            },
        }
    }
    case OPERATIONS.CREATE: {
        await goalCreate(event)
        return {
            message: 'The goal was successfully created',
            payload: {
                data: null,
            },
        }
    }
    case OPERATIONS.RETRIEVE_ALL: {
        if (event.userType === USER_TYPES.CLIENT || event.userType === USER_TYPES.ADMIN) {
            const goals = await goalRetrieveAll(event)
            return {
                message: goals && goals.length === 0 ? 'The goals were not found' : null,
                payload: {
                    data: goals && goals.length === 0 ? [] : goals,
                },
            }
        }
        ts_util.raiseUserTypeError(event.userType)
        break
    }
    default:
        throw new Error(`${event.operation} is not recognised`)
    }
}

const goalCreate = async (event) => {
    const userProfile = await ts.getUser(event.userId)

    for (let i = 0; i < event.body.goals.length; i++) {
        const goal = {
            goalTag: event.body.goals[i].goalName,
            goalReached: false,
            isForSomebodyElse: event.body.goals[i].isForSomebodyElse,
            weight: event.body.goals[i].weight || null,
        }
        // eslint-disable-next-line no-await-in-loop
        await createGoal(goal, userProfile)
    }
    return {
        message: `${event.body.goals.length} where added`,
    }
}

const goalRetrieveAll = async (event) => {
    let result = null
    if (event.userType === USER_TYPES.CLIENT) {
        const { clientId, startDate, endDate } = event.query

        result = await ts.getClientGoalsByClientId(clientId, startDate, endDate)
    }

    if (event.userType === USER_TYPES.ADMIN) {
        result = await ts.getAllUserGoals()
    }
    return result
}