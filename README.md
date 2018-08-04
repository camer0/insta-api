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
            console.log(urls[0])
            console.log(`Videos: ${videoNum}, Images: ${imgNum}, Total: ${urls.length}`)
        })
    })



    //Gets all stories.
    await instagram.getStories('djkhaled').then((data) => {
        console.log(data.stories.length + ' stories')
        console.log(data.stories[0].url)
    })


    //Gets user id from a username
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
https://instagram.fbna1-2.fna.fbcdn.net/vp/1da0b84d63b19903b8a2f0584dd3573f/5C004BFB/t51.2885-15/e35/18812609_1875010279425214_5576153514956029952_n.jpg
Videos: 0, Images: 3, Total: 3
69 stories
https://instagram.fbna1-2.fna.fbcdn.net/vp/25aee635b88160d54432883a3fca0cd1/5B68337B/t50.12441-16/38261396_261608264439420_6846402223638693584_n.mp4
25025320
```
