var request = require('request').defaults({ encoding: null });
var Twit = require('twit');

var T = new Twit({
    consumer_key:         process.env.TWITTER_API_KEY,
    consumer_secret:      process.env.TWITTER_API_KEY_SECRET,
    access_token:         process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,     // optional - requires SSL certificates to be valid.
});

// todo change all callbacks to async functions

/**
 * Post a tweet with Nerman
 * @param  {String} content text content to include
 * @param  {Array} media array of strings with ids of media to include (optional)
 */

async function post(content, media_ids) {
  // @todo format content - character count, emojis, username tagging
  // @todo ensure media ids are valid - how does this fail. Min, Max.

  // take img URLS instead of media IDs

  let params = { status: content };
  if(media_ids){
    params.media_ids = media_ids;
  }

  T.post('statuses/update', params, function (err, data, response) {  
    if(err){console.log(err)}
  });
}


/**
 * Get a base64 img string from the given url
 * @param  {String} url text content to include
 * @param  {function} callback will be called with img string
 */

async function getImageFromUrl(url, callback) {

  //@todo check that url is valid image type
  //@todo deal with error of invalid image

  request.get(url, function (error, response, body) {

    if (!error && response.statusCode == 200) {

      let media_data = Buffer.from(body).toString('base64');

        callback(media_data);

    }
  });
}
  


/**
 * Uploads an image to Twitter and gets the Twitter media ID of it
 * @param  {String} media_data base64 encoded img string
 * @param  {function} callback will be called with img string
 */

async function uploadImageToTwitter(media_data, content, callback) {

  T.post('media/upload', { "media_data": media_data }, function (err, data, response) {

    let mediaIdStr = data.media_id_string
    let altText = content;
    let meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
  
    T.post('media/metadata/create', meta_params, function (err, data, response) {
        if (!err) {
          callback(mediaIdStr);   
        }
    })
  })
}


// @todo add media_urls array as second argument
module.exports.post = async function(content) {
  await post(content);
}

//deprecated
module.exports.uploadImageAndTweet = async function(url, content) {
  let media_alt_text = content;

  await getImageFromUrl(url, function(media_data){

    uploadImageToTwitter(media_data, media_alt_text, function(mediaIdStr){

      post(content, [mediaIdStr]);

    });
  });
}

