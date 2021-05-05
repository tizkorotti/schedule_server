const router = require('express').Router()
const logger = require('../config/logger')
const { sendWhatsappTextMessage } = require('../utils/messages.js')
const { isWhiteListed,
        authenticateUser } = require('../middleware/auth')
const { handleIncomingMessage } = require('../utils/handlers')

router.post('/', isWhiteListed, authenticateUser, handleIncomingMessage, async (req, res) => {
    res.status(200).end()
    try {
        await sendWhatsappTextMessage(req.body.from.number, req.handle_result.value)
    } catch (error) {
        logger.error('ERROR POST /wamsg:', error)
    }
})
    
module.exports = router
