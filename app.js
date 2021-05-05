require('dotenv').config()

const bodyParser = require("body-parser")
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')

const logger = require('./config/logger')
const { getGoogleProfileFromCode } = require('./api/google-utils')
const { User } = require('./models')
const { wamsgRouter } = require('./routes')

startServer(process.env.PORT)

function startServer(listenPort) {
    const app = express()
    
    app.use(cors())
    app.use(bodyParser.urlencoded( { extended: false }))
    app.use(bodyParser.json())
    
    // use routes
    app.use('/wamsg', wamsgRouter)

    app.get('/', (req, res) => {
        res.send('<h1>hello!</h1>')
    })

    app.get('/google/callback', async (req, res) => {
        try {
            logger.debug(JSON.stringify(req.query))
            const { user } = await getGoogleProfileFromCode(req.query.code, req.query.state)

            await new User(user).save()
            logger.info(`New User ${user} was Authenticated and Saved!`)
            res.send(`<h1>Welcome, ${user.given_name}! Please return to Whatsapp and send 'היי' to get started</h1>`)
        } catch(error) {
            logger.error(`ERROR /google/callback - ${JSON.stringify(error)}`)
            res.send(500)
        }
        
    })

    mongoose.connect(process.env.DB_CONNECT_URL, { useNewUrlParser: true, useUnifiedTopology: true }, async () => {
        logger.info('connected to DB')
    })

    app.listen(listenPort, () => {
        logger.info(`Listening on port ${process.env.PORT}`)
    })     
}