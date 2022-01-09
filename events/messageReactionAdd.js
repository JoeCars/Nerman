const nTwitter = require(`../helpers/twitter.js`);
const MongoDB = require(`../helpers/mongodb.js`);
const nDiscord = require(`../helpers/discord.js`);
const voteThreshold = nDiscord.getThreshold();

//@todo change attachment_url to plural, handle array and post multiple to Twitter

module.exports = {
   name: 'messageReactionAdd',
   async execute(reaction, user) {

      let message = {
         content : reaction.message.content,
         id : reaction.message.id,
         user : reaction.message.author.username,
         user_id : reaction.message.author.id,
         emoji : reaction.emoji.name,
         attachments : reaction.message.attachments,
         attachment_url : ''

      }

      let tweetContent = message.content + " - " + message.user;

      if(message.attachments.size > 0) {

         message.attachment_url = message.attachments.first().url;

      }

      // let memberCount = reaction.message.guild.memberCount;
      // let voteThreshold = Math.floor(memberCount * 0.01);
      // maybe calculations based on online members would be better

      if (message.emoji == 'TweetThis') {

         let messageTweeted = await MongoDB.hasMessageBeenTweeted(message.id);
         console.log("messageTweeted " + messageTweeted);

         if(reaction.count > voteThreshold - 1) {
               //console.log("reaction count above threshold");

            if(!messageTweeted){
               console.log("message not already tweeted");

               if(message.attachment_url.length > 0) {
                  nTwitter.uploadImageAndTweet(message.attachment_url, tweetContent);
               }

               await nTwitter.post(tweetContent);
               MongoDB.markMessageAsTweeted(message.id, message.user_id);
               await reaction.message.reply("Sent Tweet: " + tweetContent);
   
            } else {
               //console.log("message already tweeted, do nothing");
            }

         }

      }

   },
};