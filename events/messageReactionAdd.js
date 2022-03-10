const nTwitter = require(`../helpers/twitter.js`);
const nMongoDB = require(`../helpers/mongodb.js`);
const nThreshold = require(`../helpers/nThreshold.js`);
const tenor = require(`../helpers/tenor.js`);

module.exports = {
   name: 'messageReactionAdd',
   async execute(reaction, user) {
      //reaction.message.guild.roles.cache.forEach(role => console.log(role.name, role.id)) //prints all rolls
      //"@everyone" is default role
      const {
         attachments,
         content,
         embeds,
         author: { username, id },
         guild: {
            members: { cache: membersCache },
            roles: { cache: rolesCache },
         },
         mentions: { members: mentionsMembers },
         reactions: { cache: reactionsCache },
      } = reaction.message;

      const authorName = membersCache.get(id).nickname ?? username;

      console.log(reaction.message.reactions);
      console.log(reactionsCache);
      console.log(await reactionsCache.get());

      // below code to calculate voteThreshold should be refactored with threshold.js code into nThreshold.js
      const Role = rolesCache.find(role => role.name == 'Voters');

      let votersOnline = membersCache
         .filter(member => member.presence?.status == 'online')
         .filter(member => member.roles.cache.find(role => role == Role)).size;

      let voteThreshold = nThreshold.getThreshold(votersOnline);

      let msgAttachmentUrls = [];

      let mappedMentions = {};
      // let mentions = reaction.message.mentions.members;

      mentionsMembers.forEach(mention => {
         mappedMentions[mention.user.id] =
            mention.nickname ?? mention.user.username;
      });

      let tweetContent = await nTwitter.formatTweet(
         content,
         authorName,
         mappedMentions
      );

      // let messageTweeted = await reactionsCache.get('931919315010220112'); //check for NermanBlast
      // let messageTweeted = await reactionsCache.get('932664888642400276'); //check for NermanBlast
      let messageTweeted =
         (await reactionsCache.get('932664888642400276')) ||
         (await reactionsCache.get('951602647767584798'));

      // console.log(
      //    'Which is Nerman,',
      //    await reactionsCache.get('931919315010220112') // THis is nothing, apparently?
      // );
      console.log(
         'and which is Blast?',
         await reactionsCache.get('932664888642400276')
      );

      if (attachments.size > 0) {
         for (const attachment of attachments) {
            msgAttachmentUrls.push(attachment[1].url);
         }
      }

      if (
         embeds.length &&
         embeds[0].provider.name === 'Tenor' &&
         content === embeds[0].url
      ) {
         const tenorURL = await tenor.getUrl(embeds);
         tweetContent = tweetContent.replace(embeds[0].url, '');
         msgAttachmentUrls.push(tenorURL);
      }

      if (
         !messageTweeted &&
         reaction.emoji.name == 'Nerman' &&
         reaction.count > voteThreshold - 1
      ) {
         nTwitter.post(tweetContent, msgAttachmentUrls);

         // mark message with NermanBlast emoji
         // await reaction.message.react('932664888642400276');
         await reaction.message.react('951602647767584798');
      }
   },
};
