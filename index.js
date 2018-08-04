const got = require('got');
const fetch = require('isomorphic-fetch')
const cheerio = require('cheerio')

module.exports = class Instagram {
    constructor(sessionid) {
        this.headers = {'x-ig-capabilities': '3w==','user-agent': 'Instagram 9.5.1 (iPhone9,2; iOS 10_0_2; en_US; en-US; scale=2.61; 1080x1920) AppleWebKit/420+',host: 'i.instagram.com', cookie: `sessionid=${sessionid}`}
    }
    /**
     * Returns stories from a user
     * @param userid - Can be either the userid (slightly faster) or the username
     */
    async getStories (userid) {
        userid = Number.isFinite(parseInt(userid)) ? userid : (await this.getID(userid))
        return new Promise((resolve, reject) => {
            if (!userid) reject(new Error('Invalid user id / username'))
            let headers = this.headers
            fetch(`https://www.instagram.com/graphql/query/?query_hash=45246d3fe16ccc6577e0bd297a5db1ab&variables={"reel_ids":["${userid}"],"tag_names":[],"location_ids":[],"highlight_reel_ids":[],"precomposed_overlay":false}`, {
                headers: this.headers
            }).then(async res => {
                let a = await res.json()
                if (a.status === 'fail') reject(new Error(a.message))
                let data = {allData: a, stories: []}
                for (let story of a.data['reels_media'][0].items) {
                    story.url = (story.video_resources) ? story.video_resources[story.video_resources.length - 1].src : story.display_url
                    data.stories.push(story)
                }
                resolve(data)
            }).catch(e => reject(e))
        })
    }
    /**
     * Returns posts from a user
     * @param {string} userid - Can be either the userid (slightly faster) or the username
     * @param {Object} options - (Optional) Options for the request
     * @param {string} options.num - Number of posts to get. Defaults to 20.
     * @param {string} options.after - 'end_cursor' to begin at
     */
    async getPosts(userid, options) {

        userid = Number.isFinite(parseInt(userid)) ? userid : (await this.getID(userid))
        let num = (options && options.num) ? options.num : 20

        let headers = this.headers
        return new Promise((resolve, reject) => {
            if (!userid) reject(new Error('Invalid user id / username'))
            let toReturn = {posts: []}
            let first = (options && options.after) ? options.after : ""
            let stop = false;
            (async function() {
                while (toReturn.posts.length < num && !stop) {
                    await new Promise(next => {
                        let afterFetch = `https://www.instagram.com/graphql/query/?query_hash=bd0d6d184eefd4d0ce7036c11ae58ed9&variables={"id":${userid},"first":${num-toReturn.posts.length}${(first !== '') ? (`,"after":"${first}"`) : ''}}`;
                        fetch(afterFetch, {
                            headers: headers
                        }).then(async res => {
                            let a = await res.json()
                            if (a.status === 'fail' && toReturn.posts.length === 0) reject(new Error(a.message))
                            if (a && a.data && a.data.user && a.data.user["edge_owner_to_timeline_media"]) {
                                let posts = toReturn.posts
                                toReturn = a.data; 
                                toReturn.posts = posts
                                
                                for (let post of a.data.user["edge_owner_to_timeline_media"].edges) {
                                    post = post.node
                                    post.url = 'https://instagram.com/p/' + post.shortcode
                                    toReturn.posts.push(post)
                                }
                                first = a.data.user['edge_owner_to_timeline_media']['page_info']['end_cursor']
                                next()
                            } else {
                                stop = true
                                next()
                            }
                            
                        }).catch(e => reject(e))
                    })
                }
                resolve(toReturn)
            })()
        })
    }
    /**
     * Returns a user id from a username
     * @param username
     */
    async getID(username) {
        let headers = this.headers
        return new Promise((resolve, reject) => {
            got('https://www.instagram.com/' + username).then((r) => {
                let $ = cheerio.load(r.body)
                let userData = $('body > script:nth-child(2)').html()
                userData = userData.substring(0, userData.length - 1).replace(/window._sharedData = /, "")
                let jsonData = JSON.parse(userData)
                resolve(jsonData["entry_data"]["ProfilePage"][0]['graphql']['user']['id'])
            }).catch(e => reject(e))
        })
    }
    /**
     * Returns an array of all media urls from posts. 
     * @param shortcode - The shortcode id of a post.
     */
    async getPostMedia(shortcode) {
        return new Promise((resolve, reject) => {
            got('https://www.instagram.com/p/' + shortcode).then((r) => {
                let dataToParseTemp = r.body
                let $ = cheerio.load(dataToParseTemp)
                let ogvideo = $("[property='og:video']")
                if (ogvideo && ogvideo['0']) ogvideo = ogvideo['0'].attribs.content
                let userData = $('body > script:nth-child(2)').html()
                userData = userData.substring(0, userData.length - 1).replace("window._sharedData = ", "")
                let jsonData = JSON.parse(userData)
                let pictures = []
                //Only one picture/video
                if (!jsonData['entry_data']['PostPage'][0]['graphql']['shortcode_media']['edge_sidecar_to_children'] || !jsonData['entry_data']['PostPage'][0]['graphql']['shortcode_media']['edge_sidecar_to_children']['edges']) {
                    if (ogvideo && ogvideo['0']) { //If video
                        pictures.push(ogvideo)
                    } else { //Not video
                        let img = jsonData['entry_data']['PostPage'][0]['graphql']['shortcode_media']['display_resources'][0].src
                        pictures.push(img)
                    }
                } else { //Multiple pictures/videos
                    let pictureData = jsonData['entry_data']['PostPage'][0]['graphql']['shortcode_media']['edge_sidecar_to_children']['edges']
                    for (let i in pictureData) {
                        //console.log(pictureData[i])
                        if (pictureData[i].node.is_video) pictures.push(pictureData[i].node.video_url.split('?')[0])
                        else pictures.push(pictureData[i].node.display_url.split('?')[0])
                    }
                }
                
                resolve(pictures)
            }).catch((e) => reject(e))
        })
        
    }

    async getUserInfo(username) {
        return new Promise((resolve, reject) => {
            got('https://www.instagram.com/' + username).then((r) => {
                let dataToParseTemp = r.body
                let $ = cheerio.load(dataToParseTemp)
                let userData = $('body > script:nth-child(2)').html()
                userData = userData.substring(0, userData.length - 1).replace("window._sharedData = ", "")
                let jsonData = JSON.parse(userData)
                resolve(jsonData['entry_data']['ProfilePage'][0].graphql.user)
            }).catch((e) => reject(e))
        })
    }

    /**
     * Returns posts from a user
     * @param {string} userid - Can be either the userid (slightly faster) or the username
     * @param {Object} options - (Optional) Options for the request
     * @param {string} options.num - Number of posts to get. Defaults to 20.
     * @param {string} options.after - 'end_cursor' to begin at
     */
    async getComments(shortcode, options) {
        let num = (options && options.num) ? options.num : 20
        let headers = this.headers
        return new Promise((resolve, reject) => {
            if (!shortcode) reject(new Error('Invalid post shortcode'))
            let commentids = []
            let toReturn = {comments: []}
            let first = (options && options.after) ? options.after : ""
            let stop = false;
            (async function() {
                while (toReturn.comments.length < num && !stop) {
                    await new Promise(next => {
                        let afterFetch = `https://www.instagram.com/graphql/query/?query_hash=f0986789a5c5d17c2400faebf16efd0d&variables={"shortcode":"${shortcode}","first":${num-toReturn.comments.length}${(first !== '') ? (`,"after":"${first}"`) : ''}}`;
                        fetch(afterFetch, {
                            headers: headers
                        }).then(async res => {
                            let a = await res.json()
                            if (a.status === 'fail' && toReturn.comments.length === 0) reject(new Error(a.message))
                            if (a && a.data && a.data.shortcode_media && a.data.shortcode_media["edge_media_to_comment"]) {
                                let comments = toReturn.comments
                                toReturn = a.data; 
                                toReturn.comments = comments
                                for (let comment of a.data.shortcode_media["edge_media_to_comment"].edges) {
                                    if (commentids.indexOf(comment.id) === -1) {
                                        comment = comment.node
                                        comment.likes = comment.edge_liked_by.count
                                        commentids.push(comment.id)
                                        toReturn.comments.push(comment)
                                    }
                                }
                                
                                first = a.data.shortcode_media["edge_media_to_comment"]['page_info']['end_cursor']
                                next()
                            } else {
                                stop = true
                                next()
                            }
                            
                        }).catch(e => reject(e))
                    })
                }
                toReturn.comments.sort(function(a,b) {return (a.created_at > b.created_at) ? 1 : ((b.created_at > a.created_at) ? -1 : 0);}); 
                toReturn.comments.reverse()
                resolve(toReturn)
            })()
        })
    }
}