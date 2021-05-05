
const logger = require('../config/logger')
const { urlGoogle } = require('../api/google-utils')
const { sendWhatsappTextMessage } = require('../utils/messages')
const { User, WhiteList } = require('../models')


const isWhiteListed = async (req, res, next) => {
  logger.debug('checking if user is whitelisted')
  const phoneNumber = await WhiteList.findOne({ whiteList: req.body.from.number })
  if(phoneNumber) {
    next()
  }
  res.status(200).end()
}

const authenticateUser = async (req, res, next) => {
  logger.debug('authenticating')
  try {
    const user = await User.findOne({ phoneNumbers: req.body.from.number })
    if(user) {
      req.user = user
      next()
    } else {
      logger.debug(`${user} is not in DB, needs to be authenticated via google`)
      const authUrl = urlGoogle()
      await sendWhatsappTextMessage(req.body.from.number, `Log in to Google: ${authUrl}&state=${req.body.from.number}`)
      res.status(200).end() 
    }
  } catch(error) {
    logger.error('AUTHENTICATING USER MIDDLEWARE ERROR', error)
    res.status(200).end()
  }
}

module.exports = {
  isWhiteListed,
  authenticateUser
}