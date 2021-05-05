const handlers = require('./handlers')
const logger = require('../config/logger')

const detectIntent = request => {
    logger.info("Command:" + request)
  
    if( request.includes('היי') || request.includes('שלום') || request.includes('הי'))
        return handlers.welcomeHandler
    
    if(request.includes('עזרה'))
        return handlers.helpHandler
    
    if(request.includes('פגישות') || request.includes('?') )
       return handlers.getEventsHandler
    
    
    
    if(request.includes('מחקי'))    
       return handlers.deleteEventHandler
    
    if(request === "1")    
       return handlers.showNewEventHelpHandler
    
    if(request === "2")    
       return handlers.showDeleteEventHelpHandler
           
    if(request === "3")    
        return handlers.showListEventsHelpHandler

    if(request === "4")    
        return handlers.showSSettingsHelpHandler
    
    if(isAddEventIntent(request) )
       return handlers.addEventHandler
    
    return handlers.welcomeHandler
}

module.exports = {
    detectIntent
}