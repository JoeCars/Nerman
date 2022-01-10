var request = require('request').defaults({ encoding: null });
//import got from 'got';
const Twit = require('twit');
const fetch = require('node-fetch');


// @todo - switch to ES6 imports
// @todo - maybe change all to TypeScript

var T = new Twit({
    consumer_key:         process.env.TWITTER_API_KEY,
    consumer_secret:      process.env.TWITTER_API_KEY_SECRET,
    access_token:         process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,     // optional - requires SSL certificates to be valid.
});


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
    let media_data0 = await getBase64ImageFromURLFetch(media_urls[0]);

    console.log("2");
    uploadImageToTwitter(media_data0, media_alt_text, function(mediaIdStr){
      console.log("3 "+mediaIdString);
      params.media_ids = [mediaIdString];    

      T.post('statuses/update', params, function (err, data, response) {  
        if(err){console.log(err)}
      });

    });

  }
}


/**
 * Get a base64 img string from the given url
 * @param  {String} url text content to include
 */

async function getBase64ImageFromURLFetch(url) {

  console.log(url);
  const response = await fetch(url);
  const buffer = await response.buffer();
  let media_data = buffer.toString('base64');
  
  return media_data;  
  
}


/**
 * Get a base64 img string from the given url
 * @param  {String} url text content to include
 * @param  {function} callback will be called with img string
 */

async function getImageFromUrl(url) {

  //@todo check that url is valid image type
  //@todo deal with error of invalid image

  let media_data_temp = '';

  await request.get(url, function (error, response, body) {

    if (!error && response.statusCode == 200) {
      let media_data = Buffer.from(body).toString('base64');
      media_data_temp = media_data;
    }

  });

  return media_data_temp;
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

  await post(content, media_urls);

}

//deprecated
module.exports.uploadImageAndTweet = async function(url, content) {


  post(content, [mediaIdString]);

}

