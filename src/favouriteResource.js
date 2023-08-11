const {
    validateInputForFavouriteResource,
    saveFavouriteResourceIdInUserProfile,
    removeFavouriteResourceIdFromUserProfile,
} = require('./helper')

exports.handler = async (event, context) => {
    console.log('Event:', JSON.stringify(event, null, 2))
    console.log('Context:', JSON.stringify(context, null, 2))

    validateInputForFavouriteResource(event)

    switch (event.body.favourite) {
    case true: {
        /* Save the favourite resource id in the user profile */
        const saveFavResource = await saveFavouriteResourceIdInUserProfile(event)
        return {
            message: 'The favourite resource was successfully added to the user\'s profile',
            payload: {
                data: saveFavResource.Attributes,
            },
        }
    }
    case false: {
        /* Remove the favourite resource id in the user profile */
        const removeFavResource = await removeFavouriteResourceIdFromUserProfile(event)
        return {
            message: 'The favourite resource was successfully removed from the user\'s profile',
            payload: {
                data: removeFavResource.Attributes,
            },
        }
    }
    default:
        throw new Error(`Operation ${event.body.favourite} is not recognised.`)
    }
}
