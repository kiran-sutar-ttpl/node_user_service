const ts = require('@thinkitiveltd/thinkitive')
// eslint-disable-next-line camelcase
const ts_util = require('@thinkitiveltd/thinkitive/utils')

const {
    USER_TYPES,
} = require('@thinkitiveltd/thinkitive/constants')

const {
    updateUser,
    updateUserStatus,
    getUserByUserId,
    getEmployeeFromEmployeesDetails,
    updateEmployeesWhitelistState,
    changeCognitoUserState,
    depletingBudgetFromUsersProfiles,
    refundBudgetToUsersProfiles,
    updateUserBudget,
} = require('./helper')

const {
    OPERATIONS,
} = require('./constants')

exports.handler = async (event, context) => {
    console.log('Event:', JSON.stringify(event, null, 2))
    console.log('Context:', JSON.stringify(context, null, 2))

    switch (event.operation) {
    case OPERATIONS.CREATE: {
        if (event.userType === USER_TYPES.USER || event.userType === USER_TYPES.ADMIN) {
            const userCreate = await ts.createUser(event)
            return {
                message: 'A user was successfully created',
                payload: {
                    data: userCreate.Attributes,
                },
            }
        }
        ts_util.raiseUserTypeError(event.userType)
        break
    }
    case OPERATIONS.RETRIEVE: {
        if (event.userType === USER_TYPES.USER || event.userType === USER_TYPES.ADMIN) {
            const user = await userRetrieve(event)
            return {
                message: null,
                payload: {
                    data: user,
                },
            }
        }
        ts_util.raiseUserTypeError(event.userType)
        break
    }
    case OPERATIONS.UPDATE: {
        if (event.userType === USER_TYPES.USER) {
            const userUpdate = await updateUser(event)
            return {
                message: 'The user attributes were updated successfully',
                payload: {
                    data: userUpdate.Attributes,
                },
            }
        }
        if (event.userType === USER_TYPES.ADMIN) {
            throw new Error(`Admin trying to update the user profile: ${event.params.Key.userId}. Action unauthorized`)
        }
        ts_util.raiseUserTypeError(event.userType)
        break
    }
    case OPERATIONS.UPDATE_BUDGET: {
        if (event.userType === USER_TYPES.USER) {
            const userBudget = await updateUserBudget(event)
            return {
                message: 'The user budget was updated successfully',
                payload: {
                    data: userBudget.Attributes,
                },
            }
        }
        if (event.userType === USER_TYPES.ADMIN) {
            throw new Error(`Admin trying to update the user budget: ${event.userId}. Action unauthorized.`)
        }
        ts_util.raiseUserTypeError(event.userType)
        break
    }
    case OPERATIONS.DELETE: {
        const userDelete = await ts.deleteUser(event)
        return {
            message: 'The user was successfully deleted',
            payload: {
                data: userDelete.Attributes,
            },
        }
    }
    case OPERATIONS.RETRIEVE_ALL: {
        if (event.userType === USER_TYPES.ADMIN) {
            const users = await ts.getAllUsersForAdmin()
            return {
                message: users && users.length === 0 ? 'The users\' records were not found' : null,
                payload: {
                    data: users && users.length === 0 ? [] : users,
                },
            }
        }
        ts_util.raiseUserTypeError(event.userType)
        break
    }
    case OPERATIONS.CHARGE_USER: {
        if (event.userType === USER_TYPES.USER) {
            const depletuserBudget = await depletingBudgetFromUsersProfiles(event)
            return {
                message: 'The user budget was successfully depleted',
                payload: {
                    data: depletuserBudget.Attributes,
                },
            }
        }
        if (event.userType === USER_TYPES.ADMIN) {
            throw new Error(`Admin trying to update the user budget: ${event.userId}. Action unauthorized.`)
        }
        ts_util.raiseUserTypeError(event.userType)
        break
    }
    case OPERATIONS.REFUND_USER: {
        if (event.userType === USER_TYPES.USER) {
            const refundBudget = await refundBudgetToUsersProfiles(event)
            return {
                message: 'The user budget was successfully refunded to the user\'s profile',
                payload: {
                    data: refundBudget.Attributes,
                },
            }
        }
        if (event.userType === USER_TYPES.ADMIN) {
            throw new Error(`Admin trying to update the user budget: ${event.userId}. Action unauthorized.`)
        }
        ts_util.raiseUserTypeError(event.userType)
        break
    }
    case OPERATIONS.DISABLE: {
        await userDisable(event)
        return {
            message: 'The user was successfully disabled',
            payload: {
                data: null,
            },
        }
    }
    default:
        throw new Error(`${event.operation} is not recognised`)
    }
}

const userRetrieve = async (event) => {
    let userProfile = null
    if (event.userType === USER_TYPES.USER) {
        userProfile = await ts.getUser(event.userId)

        let client = null
        if (userProfile && userProfile.clientId) {
            client = await ts.getClient(userProfile.clientId)
        }

        if (client !== undefined && client !== null && client.budgetSetup) {
            userProfile.budgetSetup = client.budgetSetup
        } else {
            userProfile.budgetSetup = null
        }
    }

    if (event.userType === USER_TYPES.ADMIN) {
        userProfile = await ts.getUser(event.query.userId)
        const userTransactions = await ts.getUserTransactions(userProfile.userId)

        if (userTransactions.Items.length > 0) {
            const filteredTransactions = userTransactions.Items.filter(({ state }) => state !== 'CANCELLED')

            // eslint-disable-next-line max-len
            userProfile.companySpent = filteredTransactions.filter((trans) => trans.companySpent).reduce(
                (acc, curr) => acc + curr.companySpent, 0,
            )

            // eslint-disable-next-line max-len
            userProfile.personalSpent = filteredTransactions.filter((trans) => trans.personalSpent).reduce(
                (acc, curr) => acc + curr.personalSpent, 0,
            )
        } else {
            userProfile.companySpent = 0
            userProfile.personalSpent = 0
        }
    }

    return userProfile
}

const userDisable = async (event) => {
    const { userId } = event

    // 1. Update userProfile.active === false on usersProfiles table
    // eslint-disable-next-line no-use-before-define
    const user = await getUserByUserId(userId)
    console.log('User ', user)

    // 2. Check if the user has pending transactions.
    const userTransactions = await ts.getUserTransactions(userId)
    const pendingTransactions = userTransactions.Items.filter(({ state }) => state === 'PENDING')
    console.log('Pending transactions ', pendingTransactions)
    if (pendingTransactions.length > 0) {
        throw new Error('A user has a pending transaction. You cannot deactivate a user')
    }

    // eslint-disable-next-line no-use-before-define
    await updateUserStatus(
        userId,
        false,
    )

    // 3. Mark employee.state === DISABLED on employeesDetails table
    // eslint-disable-next-line no-use-before-define
    const employee = await getEmployeeFromEmployeesDetails(user.email)
    console.log('Employee ', employee)

    // eslint-disable-next-line no-use-before-define
    await updateEmployeesWhitelistState(
        employee.employeeId,
        'DISABLED',
        'user',
    )

    // 4. Disable the cognito user on Cognito User Pool
    // eslint-disable-next-line no-use-before-define
    const cognitoUserUpdated = await changeCognitoUserState(employee, false)
    console.log('Cognito user ', cognitoUserUpdated)

    console.log('User account deactivated successfully!')
}