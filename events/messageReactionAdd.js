//const NounsTweetTools = require(`../helpers/twitter_post_status.js`);
const NounsTweetTools = require(`../helpers/twitter_helper.js`);
const messageStorage = require(`../helpers/storage.js`);
const MongoDB = require(`../helpers/mongodb.js`);
const voteThreshold = 1;

module.exports = {
   name: 'messageReactionAdd',
   async execute(reaction, user) {
      let messageContent = reaction.message.content;
      let messageId = reaction.message.id;
      let messageUser = reaction.message.author.username;
      let messageUserId = reaction.message.author.id;
      let messageAttachments = reaction.message.attachments;

      let tweetContent = messageContent + " - " + messageUser;
      let messageAttachmentURL = '';

      if(messageAttachments.size > 0) {

         messageAttachmentURL = messageAttachments.first().url;

      }

      // let memberCount = reaction.message.guild.memberCount;
      // let voteThreshold = Math.floor(memberCount * 0.01);
      // maybe calculations based on online members would be better

      if (reaction.emoji.name == 'TweetThis') {

         let messageTweeted = await MongoDB.hasMessageBeenTweeted(reaction.message.id);
         console.log("messageTweeted " + messageTweeted);

         if(reaction.count > voteThreshold - 1) {
               //console.log("reaction count above threshold");

            if(!messageTweeted){
               console.log("message not already tweeted");

               if(messageAttachmentURL.length > 0) {
                  NounsTweetTools.uploadImage(messageAttachmentURL, tweetContent);
               }

               await NounsTweetTools.tweetString(tweetContent);
               MongoDB.markMessageAsTweeted(messageId, messageUserId);
               await reaction.message.reply("Sent Tweet: " + tweetContent);
   
            } else {
               //console.log("message already tweeted, do nothing");
            }

         }

      }

   },
};