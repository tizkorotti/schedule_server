var moment = require('moment'); // require
const { google } = require('googleapis');   // google api

const logger = require('../config/logger')
const { createConnection } = require('../api/google-utils')
const { User, WhiteList } = require('../models')

const { messageType ,SONGS } = require('../consts/consts.js')
const { addMessage,
        welcomMsg,
        helpMsg,
        adminMenu,
        SettingsHelpMessage,
        SongsHelpMessage,
        GetMeetingsHelpMessage,
        DeleteMeetingsHelpMessage,
    } = require('../consts/templates.js');
const { toolresults } = require('googleapis/build/src/apis/toolresults');



const handleIncomingMessage = async (req, res, next) => {
    logger.debug('handling incoming message')


    const result = await handleUserRequest(req)//{req, requestMessage: req.body.message.content.text})
    logger.info(`Response: ${JSON.stringify(result)}`)
    req.handle_result = result
    next()
}

const handleUserRequest = async request => {
    let handler = detectIntent(request)
    res = await handler(request)
    return res
}

const detectIntent = request => {
    var requestMsg = request.body.message.content.text
    logger.info("Analyze Command:" + requestMsg)
    if(request.user.userPermissions.inAdminSession)
    {

    }
    if(requestMsg.includes('היי') || requestMsg.includes('שלום') || requestMsg.includes('הי'))
        return welcomeHandler
    
    if(requestMsg.includes('עזרה'))
        return helpHandler
    
    if(requestMsg.includes('פגישות') || requestMsg.includes('?') )
       return getEventsHandler        
    
    if(requestMsg.includes('מחקי'))    
       return deleteEventHandler

    if(requestMsg.includes('שרית'))    
       return playSaritSongHandler
    
    if(requestMsg === "1")    
       return showNewEventHelpHandler
    
    if(requestMsg === "2")    
       return showDeleteEventHelpHandler
           
    if(requestMsg === "3")    
        return showListEventsHelpHandler

    if(requestMsg === "4")    
        return showMMySongsHelpHandler

    if(requestMsg === "5")    
        return showSSettingsHelpHandler
        
    if(requestMsg.toLowerCase().includes("whitelisted") && isAuthenticated)
        return addNumberToWhiteList

    if(requestMsg.toLowerCase() === "admin_session" || request.user.userPermissions.isAdmin)
        return handleAdminSession
    
    if(isAddEventIntent(requestMsg))
       return addEventHandler

    return welcomeHandler
}

let didAskForPassword = false
let isAuthenticated = false

const handleAdminSession = async (request) => {
    // TODO: add cancel timeout session
    
    const user = await User.findOne({ phoneNumbers: request.body.from.number })
    logger.debug(request.user.userPermissions.inAdminSession, user.userPermissions.inAdminSession)
    if (user && user.userPermissions.isAdmin) {
        if (true) {
            if(didAskForPassword){
                let password = request.body.message.content.text
                if(password === user.userPermissions.adminPassphrase){
                    logger.debug('starting timer')
                    setTimeout(async () => {
                        logger.debug('ending session')
                        isAuthenticated = false
                        didAskForPassword = false
                        await User.findOneAndUpdate({ "_id": user._id}, user)
                    }, 30000)
                    isAuthenticated = true
                    return showAdminMenu()
                }
                else{
                    didAskForPassword = false
                    return {type: messageType.text, value: "wrong password"}
                }

            }
            else{
                didAskForPassword = true
                return {type: messageType.text, value: "enter password"}
            }
             
        }
        else {
            user.userPermissions.inAdminSession = true
            user.userPermissions.timeout = Date.now()
            await User.findOneAndUpdate({ "_id": user._id}, user)
        }
    } 
    else {
        return {type: messageType.text, value: "hello user"}
    }
}

const addNumberToWhiteList = async (request) => {

    try {
        let {whiteList} = await WhiteList.findOne({})
        let numberToAddMessage = request.body.message.content.text

        // phone number regex in 972xxxxxxxxx format
        const re = /(972[0-9]{9}$)/
        const results =  numberToAddMessage.match(re)  

        if (results) {
            const numberToAdd = results[0]
            whiteList.push(numberToAdd)
            await WhiteList.updateOne({whiteList})
            request.user.userPermissions.inAdminSession = false 
            await User.findOneAndUpdate({ "_id": request.user._id}, request.user)
            // TODO: cancel admin session flow
            return {type: messageType.text, value: "Added to white list"}
        }
        return {type: messageType.text, value: "Invalid phone number"}
    }
    catch(e) {
        logger.error(`addNumberToWhitelist ERROR - ${JSON.stringify(e)}`)
    }
}

const playSaritSongHandler = async (userRequest) => {
    return  {type: messageType.text, value: SONGS[ Math.floor(Math.random() * SONGS.length)]    } ;
}

var lastEvents = []
const getEventsHandler = async (request) => {
    
    const auth = createConnection()
    auth.setCredentials(request.user.tokens)    

    var startDate = new Date();
    var endDate = moment(startDate).add(7,"days").toDate()
    
     // Activation
    const events = await getEventsFromGoogleCalendar(startDate,endDate, auth).then(res => res)
  
    //SAVE EVENTS globally FOR FUTURE DELETE REQUEST
    lastEvents = events
    //Handle Activation result
    var result = `שלום ${request.user.given_name}, אלה הפגישות שלך לשבוע הקרוב:\n`
    events.forEach((event, i) => result += `${i+1}. ${moment(event.start.dateTime).format("DD/MM HH:mm")}  ${event.summary}\n`)   
    if(events.length >0 ) {
        result += `\nלמחיקה, רשום מחקי ואת מספר האירוע
לדוגמה: מחקי 2`
    }
    else {
        result = "לא נמצאו אירועים בשבוע הקרוב"
    }
     
    return {
        type: messageType.text,
        value: result
    }
}

const deleteEventHandler = async request => {
    const auth = createConnection()
    auth.setCredentials(request.user.tokens)

    var requestMsg = request.body.message.content.text
    var result = ""
    if (lastEvents == undefined || lastEvents.length == 0) {       
        return await getEventsHandler(request)        
    }
        
    var index = requestMsg.trim().split(' ')[1]    
    if (index > lastEvents.length) return "מספר אירוע לא מוכר:" + index

    var eventId = lastEvents[index-1].id
    var result = await deleteEventFromGoogleCalendar(eventId, auth).then(res => res)
    lastEvents = []
    if(result == "OK"){
        result =  "האירוע נמחק"     
    }
    else{
        result =  `הפעולה לא הצליחה`     
    }
    return {
        type: messageType.text,
        value:result
    }
}

function analyzeTime(txt)
{
    var hours = 0
    var minutes= 0
    // HH:mm pattern
    var reg = new RegExp('(0[0-9]|1[0-9]|2[0-3]|[1-9])[:]([0-5][0-9])','i')
    let res = txt.trim().match(reg)    
    if(res != null && res.length == 3)
    {                   
        hours = parseInt(res[1])
        minutes = parseInt(res[2])                    
    } 

    return {
        hours,
        minutes,
        index: res.index,
        length: res[0].length
    }                    
}

function analyzeDate(request)
{
    //  regex covers DD/MM D/M DD/M D/MM     
    var reg = new RegExp('([12][0-9]|0[1-9]|3[01]|[1-9])[/](0[1-9]|1[012]|[1-9])','i')
    let res = request.trim().match(reg)    
    if(res != null && res.length == 3)
    {        
        logger.debug(`analyze ${JSON.stringify(res)}`)
        var month = parseInt(res[2])
        var day = parseInt(res[1])
        var currentMonth = new Date().getMonth()
        var currentYear = new Date().getFullYear()
        var currentDay = new Date().getDate()
        //past date moves to next year
        if(month < currentMonth || (month == currentMonth &&  day < currentDay)) {
            currentYear += 1            
        }      
        var date = new Date()
        date.setFullYear(currentYear)
        date.setMonth(month-1) // months start at 0
        date.setDate(day)                
        return {date:date, startIndex:res.index, length:res[0].length}
    }                    
    else
    {        
        //look for dateExpression
        var timeTagMap = new Map();
        timeTagMap.set('היום', new Date())
        timeTagMap.set('מחר',  moment(new Date()).add(1,"days").toDate() )
        
        timeTagMap.set('ראשון', getNextDay(0))
        timeTagMap.set('בראשון', timeTagMap.get("ראשון") )        
        timeTagMap.set('שני', getNextDay(1) )
        timeTagMap.set('בשני',timeTagMap.get('שני'))
        timeTagMap.set('שלישי', getNextDay(2) )
        timeTagMap.set('בשלישי',timeTagMap.get('שלישי'))
        timeTagMap.set('רביעי', getNextDay(3))
        timeTagMap.set('ברביעי',timeTagMap.get('רביעי'))
        timeTagMap.set('חמישי', getNextDay(4))
        timeTagMap.set('בחמישי',timeTagMap.get('חמישי'))
        timeTagMap.set('שישי', getNextDay(5) )
        timeTagMap.set('בשישי',timeTagMap.get('שישי'))
        timeTagMap.set('שבת', getNextDay(6))
        timeTagMap.set('בשבת',timeTagMap.get('שבת'))
        
        
        var firstWord = request.trim().split(' ')[0]
        if(timeTagMap.has(firstWord)){
            return { date:timeTagMap.get(firstWord),startIndex: request.search(firstWord), length: firstWord.length }
        }
        return null
    }
}

function getNextDay(dayIndex){
    // wanted day > today ? wanted day: next week wanted day
    return  moment().day( dayIndex >=  moment().day() ? dayIndex: 7 + dayIndex ).toDate()
}

function analyzeTitle(request, startDateExpressionIndex, startDateExpressionLength, startTimeExpressoinIndex,startTimeExpressoinLength){
    title =""
    if( startDateExpressionIndex >= startTimeExpressoinIndex){
        title = request.substring( startDateExpressionIndex + startDateExpressionLength).trim()
    }
    else{
        title = request.substring( startTimeExpressoinIndex + startTimeExpressoinLength).trim()
    }
    return title;
}

function addEventAnalzye(request){
    var time = analyzeTime(request)
    var startDate = analyzeDate(request)
    startDate.date.setHours(time.hours)
    startDate.date.setMinutes(time.minutes)
    var endDate = moment(startDate.date).add(1,"hour").toDate()
    var summary = analyzeTitle(request,startDate.startIndex,startDate.length,time.index,time.length)       
    var result = {startDate:startDate.date ,endDate:endDate ,summary:summary}
    
    return result
}

function isAddEventIntent(request){    
    var conatinsNumericDate = request.search("([12][0-9]|0[1-9]|3[01]|[1-9])[/](0[1-9]|1[012]|[1-9])")  >= 0
    var conatinsTime = request.search("(0[0-9]|1[0-9]|2[0-3]|[1-9])[:]([0-5][0-9])")  >= 0
    var conatinsVerblaDate = request.search("(היום|מחר|בראשון|בשני|בשלישי|ברביעי|בחמישי|בשישי|בשבת|ראשון)") >=0
    
    return (conatinsNumericDate && conatinsTime) || (conatinsVerblaDate && conatinsTime) 
}

const addEventHandler = async (request) => {
    var requestMsg = request.body.message.content.text
    var event = addEventAnalzye(requestMsg)
    if(event == null)
        return  {
            type: messageType.text,
            value: `
לא הצלחתי לאתר את פרטי האירוע.
הקש 1 לעזרה`
        }
    // Activation
    const auth = createConnection()
    auth.setCredentials(request.user.tokens)
    var result = await addEventToGoogleCalendar({ summary:event.summary, startDate: event.startDate,endDate: event.endDate}, auth).then(res => res)
       
    //Handle Activation result
    if(result == "OK"){
        result =  `פגישה בנושא ${event.summary} התווספה ליומן ב ${moment(event.startDate).format("DD/MM HH:mm")} `     
    } else if(result == "FAIL") {
        result =  `הפעולה לא הצליחה`     
    } else { // overlapping
        result = `יש כבר אירוע בזמן המבוקש: ${result}`
    }
    return {type: messageType.text, value:result} ;
}

const helpHandler = async () => {
    return  { type : messageType.text, value : helpMsg} ;
}

const welcomeHandler = async (request) => {
    return { type: messageType.text, value: welcomMsg(request.user.given_name) } 
}

const showNewEventHelpHandler = async () => {
 return {type: messageType.text, value:addMessage } 
}

const showDeleteEventHelpHandler = async () => {
    //return {type: messageType.image, value:HELP_IMAGES.DELETE_EVENT} 
    return {type: messageType.text, value:DeleteMeetingsHelpMessage} 
}

const showListEventsHelpHandler = async () => {
    //return {type: messageType.image, value:HELP_IMAGES.LIST_EVENTS} 
    return {type: messageType.text, value:GetMeetingsHelpMessage} 
}

const showSSettingsHelpHandler = async () => {
    return  {type: messageType.text, value:SettingsHelpMessage} ;
}

const showMMySongsHelpHandler = async () => {
    return  {type: messageType.text, value:SongsHelpMessage} ;
}

const showAdminMenu = () => {
    return {type: messageType.text, value:adminMenu};
}

//////////////////////////////////////
/////// Google API       /////////////
//////////////////////////////////////
async function deleteEventFromGoogleCalendar(eventId, auth) {
    logger.info(`Delete from Calendar: ${eventId}`)
    const calendar = google.calendar({version: 'v3', auth})
    const deleteFailed = await calendar.events.delete({
        calendarId: 'primary',
        eventId
    }).then(res => res.body)
    
    return !deleteFailed ? "OK": "FAIL"
}

const addEventToGoogleCalendar = async (event, auth) => {

    const resource = {
        'summary': event.summary,
        'location': '',
        'start': {
            'dateTime': event.startDate, //'2015-05-28T09:00:00-07:00',
            'timeZone': 'Asia/Jerusalem',
          },
          'end': {
            'dateTime': event.endDate, //'2015-05-28T17:00:00-07:00',
            'timeZone': 'Asia/Jerusalem',
        }
    }

    const options = {
        auth,
        calendarId: 'primary',
        resource
    }

    const calendar = await google.calendar({version: 'v3', auth})
    const res = await calendar.freebusy.query({
            resource: {
                timeMin: event.startDate,
                timeMax: event.endDate,
                timeZone: 'Asia/Jerusalem',
                items: [{
                    id: options.calendarId
                }]
            },
        })
    const { busy } = res.data.calendars.primary
    let response
    // TODO: add more robust error handling
    if (!busy.length) { // if no overlapping then events that collide will be here
        response = await calendar.events.insert(options).then(response => response)
        return response.status == 200 ? "OK" : "FAIL"
    } else {
        return busy.map(event => `${moment(event.end).format("DD/MM HH:mm")} - ${moment(event.start).format("DD/MM HH:mm")}`).join('\n')
    }    
}

const getEventsFromGoogleCalendar = async (startDate,endDate, auth) => {
    const calendar = google.calendar({version: 'v3', auth})
    const options = {
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        // maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }
    try {
        const items = await calendar.events.list(options).then(list => list.data.items)
        logger.debug(items)
        return items
    } catch (err) {
        return logger.error(`getEventsFromGoogleCalendar ERROR - ${err}`)
    }
}


module.exports = {
    handleUserRequest,
    handleIncomingMessage
}