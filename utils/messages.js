const fetch = require('node-fetch')
// const { options } = require('../routes/wamsg')
const base64 = require('base-64')
const { FROM_NUMBER_WA,
        WHATSAPP_MESSAGE_SANDBOX_URL } = require('../consts/consts')

const authenticationCode = `${process.env.VONAGE_API_KEY}:${process.env.VONAGE_API_SECRET}`

const sendWhatsappTextMessage = async (toNumber, textMessage) => {
    // fetch options
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${base64.encode(authenticationCode)}`
        },
        body: JSON.stringify({
            from: {
                type: 'whatsapp',
                number: FROM_NUMBER_WA
            },
            to: {
                type: 'whatsapp',
                number: toNumber
            },
            message: {
                content: {
                    type: 'text',
                    text: textMessage
                }
            }
        })
    }
    try {
        await fetch(WHATSAPP_MESSAGE_SANDBOX_URL, options)
    } catch(error) {
        logger.error('SEND WHATSAPP RESPONSE ERROR:', error)
    }
}

module.exports = {
    sendWhatsappTextMessage
}