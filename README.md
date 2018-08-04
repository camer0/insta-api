# insta-api

An Instragram API that doesn't rely on Instagram's deprecating API.

# Installing
```npm install insta-api```

# Usage
```javascript
let Instagram = require('./instagram-api');
let instagram = new Instagram("Enter your session id. Grab from your cookies in a browser");

(async function() {
    //Most functions also accept user ids instead of usernames. getUserInfo only accepts a username.
    await instagram.getUserInfo('joshuadun').then((userInfo) => {
        console.log('Biography: ' + userInfo.biography)
    })
    //num option is how many posts to fetch. Default is 20 if not entered.
    await instagram.getPosts('tylerrjoseph', {num: 40}).then((data) => {
        console.log(data.posts.length + ' posts')
        console.log(data.posts[0].shortcode)
        instagram.getPostMedia(data.posts[0].shortcode).then((urls) => {
            let videoNum = 0, imgNum = 0
            for (let url of urls) {
                if (url.endsWith('.mp4')) videoNum++
                else imgNum++
            }
            console.log(`Videos: ${videoNum}, Images: ${imgNum}, Total: ${urls.length}`)
        })
    })
    //Gets all stories.
    await instagram.getStories('djkhaled').then((data) => {
        console.log(data.stories.length + ' stories')
    })

    await instagram.getID('instagram').then((id) => {
        console.log(id)
    })
})()
```

**Expected output:**
```
Biography: I'm not sentimental. This skin and bones is a rental.
40 posts
BU5BbaagEUV
Videos: 0, Images: 3, Total: 3
68 stories
25025320```
