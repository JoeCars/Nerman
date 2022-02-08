const fetch = require('node-fetch');

const getUrl = async embeds => {
   const tenorBaseURL = `https://g.tenor.com/v1/gifs?media_filter=minimal&limit=1&key=${process.env.TENOR_API_KEY}&ids=`;
   const gifID = embeds[0].url.slice(-8);
   const tenorResp = await fetch(`${tenorBaseURL}${gifID}`);
   const data = await tenorResp.json();
   const gifURL = data.results[0].media[0].gif.url;
   return gifURL;
};
module.exports.getUrl = async embeds => {
   return await getUrl(embeds);
};
