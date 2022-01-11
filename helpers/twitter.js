var request = require('request').defaults({ encoding: null });
//import got from 'got';
const Twit = require('twit');
const fetch = require('node-fetch');
let keys_valid = true;
 
let logging = false;

try {

  var T = new Twit({
      consumer_key:         process.env.TWITTER_API_KEY,
      consumer_secret:      process.env.TWITTER_API_KEY_SECRET,
      access_token:         process.env.TWITTER_ACCESS_TOKEN,
      access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
      timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
      strictSSL:            true,     // optional - requires SSL certificates to be valid.
  });

  keys_valid = true;

} catch (e) {

  console.log(e);

  keys_valid = false;

}


/**
 * Post a tweet with Nerman
 * @param  {String} content text content to include
 * @param  {Array} media array of strings with ids of media to include (optional)
 */

async function post(content, media_urls) {
  // @todo format content - character count, emojis, username tagging
  // @todo ensure media ids are valid - how does this fail. Min, Max.
  // take img URLS instead of media IDs

  let params = { status: content };

  if(media_urls){

    //need to turn media_urls into media_ids
    let media_alt_text = content;
    let media_data0 = await getImgString(media_urls[0]);

    uploadImageToTwitter(media_data0, media_alt_text, function(mediaIdStr){

      params.media_ids = [mediaIdStr];    

      T.post('statuses/update', params, function (err, data, response) {  
        if(err){console.log(err)}
      });

    });

  }
}


/**
 * Get a base64 img string from the given url
 * @param  {String} url address of image
 */

async function getImgString(url) {

  //check error status and response code
  //check file types
  //check header for appropriate image types

  console.log(url);
  const response = await fetch(url);
  const buffer = await response.buffer();
  let media_data = buffer.toString('base64');
  
  return media_data;  
  
}


/**
 * Uploads an image to Twitter and gets the Twitter media ID of it
 * @param  {String} media_data base64 encoded img string
 * @param  {function} callback will be called with img string
 */

function uploadImageToTwitter(media_data, content, callback) {

  T.post('media/upload', { "media_data": media_data }, async function (err, data, response) {

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

module.exports.post = async function(content, media_urls) {
  if(keys_valid){
    
    await post(content, media_urls);

  }

}

//deprecated
module.exports.uploadImageAndTweet = async function(url, content) {

  if(keys_valid){  

    post(content, [mediaIdString]);

   }

}

