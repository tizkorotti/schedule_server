const { google } = require('googleapis')

const googleConfig = {
    cliendId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirect: 'http://vps-0d4df705.vps.ovh.ca:8764/google/callback'
}

/**
 * Create the google auth object which gives us access to talk to googl's api
 */
function createConnection() {
    return new google.auth.OAuth2(
        googleConfig.cliendId,
        googleConfig.clientSecret,
        googleConfig.redirect 
    )
}

/**
 * This scope tells google what informatuion we want to request 
 */
const defaultScope = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar'
]

/**
 * get a url which will open the google sign-in page and request access to the scope provided
 */
function getConnectionUrl(auth) {
    return auth.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: defaultScope 
    })
}

/**
 * Create the url to be sent to the client
 */

 function urlGoogle() {
     const auth = createConnection()
     const url = getConnectionUrl(auth)
     return url
 }

 /**
  * helper function to get the library with access to the google info api
  */
 function getGoogleProfileApi(auth) {
     return google.oauth2({version: 'v2', auth})
 }

 /**
  * extract the email and id and name of the user
  */

async function getGoogleProfileFromCode(code, state) {
    const auth = createConnection()

    const data = await auth.getToken(code)
    const tokens = data.tokens
    //add tokens to the api so we have access to the account
    auth.setCredentials(tokens) 

    const profile = getGoogleProfileApi(auth)
    const user = await profile.userinfo.get().then(res => res.data)

    return {
        user: {
            ...user,
            tokens,
            primaryNumber: state,
            phoneNumbers:[state],
            userPermissions: {
                isAdmin: false,
                inAdminSession: false,
                adminPassphrase: '',
                sessionTimeout: 0
            }
        },
        auth
    }
}

module.exports = {
    urlGoogle,
    getConnectionUrl,
    createConnection,
    getGoogleProfileApi,
    getGoogleProfileFromCode,
    googleConfig
}