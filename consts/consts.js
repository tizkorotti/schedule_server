const REDIAL_DELAY_MILLISECONDS = 180000  // three minutes
const DEFAULT_NOFITY_MILLISECONDS = 1800000  // thirty minutes
const CALENDAR_POLL_INTERVAL = 3000  // three seconds
const DEFAULT_LOOKAHEAD_DAYS = 7 * (60 * 60 * 24 * 1000)  // 7 days
const RUN_EVERY =  5000 // 5 secs
const FROM_NUMBER_VONAGE = "972526548353"  // vonage number 
const FROM_NUMBER_WA = "14157386170"  // whatsapp number
const WHATSAPP_MESSAGE_SANDBOX_URL = "https://messages-sandbox.nexmo.com/v0.1/messages"


const messageType = {
    text: 'text',
    image: 'image',
    video: 'video',    
}

const HELP_IMAGES = {
    NEW_EVENT: '/images/1.jpg',
    DELETE_EVENT: '/images/1.jpg',
    LIST_EVENTS: '/images/1.jpg',
}

const SONGS = [
    "https://www.youtube.com/watch?v=ePara4T1BwY",
    "https://www.youtube.com/watch?v=9yVsFL6oMGE",
    "https://www.youtube.com/watch?v=opwdAAgbJYI",
    "https://www.youtube.com/watch?v=7QkhkMRWb28",
    "https://www.youtube.com/watch?v=LdjfN1Llw0c",
    "https://www.youtube.com/watch?v=5i-94at2SDA",
    "https://www.youtube.com/watch?v=bBCIefOfUKY",
    "https://www.youtube.com/watch?v=g0fsM6Elu5c",
    "https://www.youtube.com/watch?v=2_A0ZNr2FQE",
    "https://www.youtube.com/watch?v=CcWGhp667mk",
    "https://www.youtube.com/watch?v=_D9WuX2tURc",
    "https://www.youtube.com/watch?v=aHng7jFEpzc",
  ]

module.exports = {
    REDIAL_DELAY_MILLISECONDS,
    DEFAULT_NOFITY_MILLISECONDS,
    CALENDAR_POLL_INTERVAL,
    DEFAULT_LOOKAHEAD_DAYS,
    RUN_EVERY,
    FROM_NUMBER_VONAGE,
    FROM_NUMBER_WA,
    messageType,
    SONGS,        
    HELP_IMAGES,
    WHATSAPP_MESSAGE_SANDBOX_URL
}

