const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const config = require('./config.json')
const video_id = config.video_id

const authorize = () => {
    const credentials = config.client_secret
    const clientSecret = credentials.installed.client_secret
    const clientId = credentials.installed.client_id
    const redirectUrl = credentials.installed.redirect_uris[0]
    const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl)

    oauth2Client.credentials = config.oauth_token
    return oauth2Client
}

const getVideoViews = (auth) => {
    const service = google.youtube('v3')
    return new Promise((resolve, reject) => {
        service.videos.list({
            auth: auth,
            part: 'statistics',
            id: video_id
        }, (err, response) => {
            if(err) return reject(err)
            resolve(response.data.items[0].statistics.viewCount)
        })
    })
}

const updateVideoTitle = (auth, views) => {
    const service = google.youtube('v3')
    return new Promise((resolve, reject) => {
        service.videos.update({
            auth: auth,
            part: 'snippet',
            resource: {
                id: video_id,
                snippet: {
                    title: `This Video Has ${new Intl.NumberFormat('en-US').format(views)} views`,
                    categoryId: 27
                }
            }
        }, (err, response) => {
            if(err) return reject(err)
            resolve(response.data.snippet.title)
        })
    })
}

const main = async () => {
    try {
        const auth = authorize()
        const videoViews = await getVideoViews(auth)
        const videoTitle = await updateVideoTitle(auth, videoViews)
        console.log(videoTitle)
    } catch(err){
        console.error(err)
    }
}

main()
setInterval(main, 600000)