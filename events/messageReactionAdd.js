// const nTwitter = require(`../helpers/twitter.js`);
const nMongoDB = require(`../helpers/mongodb.js`);
const nThreshold = require(`../helpers/nThreshold.js`);
const tenor = require(`../helpers/tenor.js`);

// role allowed for nerman tweet functions - for now env based on DEPLOY_STAGE
const allowedRoles =
   process.env.DEPLOY_STAGE === 'staging'
      ? process.env.TESTNERMAN_VOTER_ID
      : process.env.DEVNERMAN_VOTER_ID;


// nerman emoji ID - for now env based on DEPLOY_STAGE
const nermanEmojiId =
   process.env.DEPLOY_STAGE === 'staging'
      ? process.env.TESTNERMAN_EMOJI_ID
      : process.env.DEVNERMAN_EMOJI_ID;

// ez loggins
const { log: l, time: t, timeEnd: te } = console;

module.exports = {
   name: 'messageReactionAdd',
   async execute(reaction, user) {
      //reaction.message.guild.roles.cache.forEach(role => console.log(role.name, role.id)) //prints all rolls
      //"@everyone" is default role

      const {
         emoji,
         emoji: { id: emojiId },
         message: {
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
         },
      } = reaction;

      l(process.env.DEPLOY_STAGE);
      l({ nermanEmojiId });
      l({ emojiId });

      // if (process.env.DEPLOY_STAGE === 'staging') return;
      if (emojiId !== nermanEmojiId) {
         l(`This is not MY nerman --- ${process.env.DEPLOY_STAGE}`);
         return;
      } else {
         l(`MY BABY NERMAN --- ${process.env.DEPLOY_STAGE}`);
      }

      const authorName = membersCache.get(id).nickname ?? username;

      // console.log({ reaction });
      console.log({ emoji });
      console.log(emoji.name);
      console.log(emoji.id); // yus
      console.log(emoji.identifier); // maybe yus
      // console.log(await emoji.toString());
      // console.log(await reaction.fetch());
      // console.log(reaction.message.reactions);
      // console.log(reactionsCache);
      // console.log(await reactionsCache.get());

      // return;

      // below code to calculate voteThreshold should be refactored with threshold.js code into nThreshold.js

      // const Role = rolesCache.find(role => role.name == 'Voters');
      const Role = rolesCache.find(role => role.id === allowedRoles);

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
      let messageTweeted = await reactionsCache.get('932664888642400276'); //check for NermanBlast

      // console.log(
      //    'Which is Nerman,',
      //    await reactionsCache.get('931919315010220112') // THis is nothing, apparently?
      // );
      // console.log(
      //    'and which is Blast?',
      //    await reactionsCache.get('932664888642400276')
      // );

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

      // if (
      //    !messageTweeted &&
      //    reaction.emoji.name == 'Nerman' &&
      //    reaction.count > voteThreshold - 1
      // ) {
      if (
         !messageTweeted &&
         emojiId === nermanEmojiId &&
         reaction.count >= voteThreshold
      ) {
         nTwitter.post(tweetContent, msgAttachmentUrls);

         // mark message with NermanBlast emoji
         await reaction.message.react('932664888642400276');
      }
   },
};
