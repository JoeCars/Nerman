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


/**
 * Tell Nerman to Post a Tweet
 * @param  {String} content text content to include
 * @param  {Array} media array of strings with ids of media to include
 */

async function nermanTweet(content, media_ids) {
  // @todo format content - character count, emojis, username tagging
  // @todo ensure media ids are valid - how does this fail. Min, Max.
  let params = { status: content };
  if(media){
    params.media_ids = media_ids;
  }

  T.post('statuses/update', params, function (err, data, response) {  
    if(err){console.log(err)}
  });
}
  
async function tweet_string_with_image(url, content) {

  request.get(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');

          T.post('media/upload', { "media_data": Buffer.from(body).toString('base64') }, function (err, data, response) {

              var mediaIdStr = data.media_id_string
              var altText = content;
              var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

              T.post('media/metadata/create', meta_params, function (err, data, response) {

                  if (!err) {

                      nermanTweet(content, [mediaIdStr]);
                  }
              })
          })


    }
});

}


module.exports.nermanTweet = async function(content) {
  await nermanTweet(content);
}

module.exports.uploadImage = async function(url, content) {
  await tweet_string_with_image(url, content);
}