const mongoose = require('mongoose')

const WhiteListSchema = mongoose.Schema({
    whiteList: [String]
})

module.exports = mongoose.model('WhiteList', WhiteListSchema)