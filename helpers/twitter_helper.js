const { twitter } = require('../config.json');
var request = require('request').defaults({ encoding: null });
var Twit = require('twit');

var T = new Twit({
    consumer_key:         twitter.api_key,
    consumer_secret:      twitter.api_key_secret,
    access_token:         twitter.access_token,
    access_token_secret:  twitter.access_token_secret,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,     // optional - requires SSL certificates to be valid.
});


async function tweet_string(content) {

    T.post('statuses/update', { status: content }, function(err, data, response) {
      if(err){
        console.log(err);
      }
    })

}
  

async function get_image_from_url(url) {

  if(!/\.(png|jpe?g|svg)$/.test(url)) {
    console.log("Failed to post media, URL is not supported file type");
    console.log(url);
    return null;
  }

}


module.exports.tweetString = async function(content) {
  await tweet_string(content);
}

module.exports.uploadImage = async function(url, content) {



  request.get(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');

            T.post('media/upload', { "media_data": Buffer.from(body).toString('base64') }, function (err, data, response) {

                var mediaIdStr = data.media_id_string
                var altText = content;
                var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

                T.post('media/metadata/create', meta_params, function (err, data, response) {

                    if (!err) {

                        var params = { status: content, media_ids: [mediaIdStr] }
                
                        T.post('statuses/update', params, function (err, data, response) {

                        })
                    }
                })
            })


      }
  });
  
}