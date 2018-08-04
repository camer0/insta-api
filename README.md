# insta-api

An Instragram API that doesn't rely on Instagram's deprecating API.

# Installing
```npm install insta-api```

# Usage

### Importing the module
```javascript
let Instagram = require('insta-api');
let instagram = new Instagram("Enter your session id. Grab from your cookies in a browser");
```

### getUserInfo(username)
```javascript
instagram.getUserInfo('joshuadun').then((userInfo) => {
    console.log('Biography: ' + userInfo.biography)
})
```
Returns: `Biography: I'm not sentimental. This skin and bones is a rental.`

### getPosts(username or userid)
```javascript
instagram.getPosts('tylerrjoseph', {num: 10}).then(async (data) => {
    let myData = {}
    myData.receivedPosts = data.posts.length
    let firstPost = data.posts[0]
    myData.firstPost = {shortcode: firstPost.shortcode}


    //Posts have two functions: getPostMedia and getComments
    let urls = await firstPost.getPostMedia()
    myData.firstPost.firstMedia = urls[0]
    let commentData = await firstPost.getComments({num: 1})
    myData.firstPost.firstComment = commentData.comments[0].text
    console.log(myData)
})
```
Returns: 
```js
{
    receivedPosts: 10,
    firstPost: {
        shortcode: 'BU5BbaagEUV',
        firstMedia: 'https://instagram.fbna1-2.fna.fbcdn.net/vp/1da0b84d63b19903b8a2f0584dd3573f/5C004BFB/t51.2885-15/e35/18812609_1875010279425214_5576153514956029952_n.jpg',
        firstComment: 'Post betch'
    }
}
```

### getPostFromShortcode(shortcode)
```javascript
instagram.getPostByShortcode('BlSBbgSgZRh').then((post) => {
    console.log(`${post.url} has ${post.likes} likes and ${post.comments} comments`)
})
```
Returns `https://instagram.com/p/BlSBbgSgZRh has 400083 likes and 16279 comments`

### getStories(username or userid)
```javascript
instagram.getStories('djkhaled').then((data) => {
    console.log(data.stories.length + ' stories')
    console.log(data.stories[0].url)
})
```
Returns: 
```js
{total: 54, first: 'https://instagram.fbna1-2.fna.fbcdn.net/vp/4d8ce1d14e6acd1cb75ce11a3f31bc4e/5B67C6AD/t50.12441-16/37886089_2108992515842077_1764245142725384721_n.mp4'}
```

### getID(username)
```javascript
instagram.getID('instagram').then((id) => {
    console.log(id)
})
```
Returns: `25025320`
