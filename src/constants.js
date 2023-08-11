const { STAGE_NAME } = process.env

const OPERATIONS = {
    CREATE: 'create',
    RETRIEVE: 'retrieve',
    UPDATE: 'update',
    CANCEL: 'cancel',
    RETRIEVE_ALL: 'retrieveAll',
    PING: 'ping',
    DELETE: 'delete',
    ECHO: 'echo',
    UPDATE_BUDGET: 'UPDATE_BUDGET',
    CHARGE_USER: 'CHARGE_USER',
    REFUND_USER: 'REFUND_USER',
    DISABLE: 'DISABLE',
}

const EVENTS = {
    INSERT: 'INSERT',
    MODIFY: 'MODIFY',
    REMOVE: 'REMOVE',
}

const FUNCTION_NAMES = {
    CLIENTS_FUNCTION_NAME: `clients-ResponseManager-${STAGE_NAME}`,
}

module.exports = {
    OPERATIONS,
    resetUserWhiteList,
    EVENTS,
    USER_CHANGES,
    FUNCTION_NAMES,
}
