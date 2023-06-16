// disabled
const stahp = process.env.NODE_ENV === 'development' ? true : false;
let nTwitter;
console.log('messageReactionAdd stahp => ', stahp);
if (stahp === false) {
   nTwitter = require(`../../../../helpers/twitter.js`);
}
// const nTwitter = require(`../helpers/twitter.js`);
const nMongoDB = require(`../../../../helpers/mongodb.js`);
const nThreshold = require(`../../../../helpers/twitter/nThreshold.js`);
const tenor = require(`../../../../helpers/tenor.js`);
const Logger = require('../../../../helpers/logger.js');

// role allowed for nerman tweet functions - for now env based on DEPLOY_STAGE
const allowedRoles =
   process.env.DEPLOY_STAGE === 'development'
      ? process.env.DEVNERMAN_VOTER_ID
      : process.env.TESTNERMAN_NOUNCIL_ROLE_ID;

// nerman emoji ID - for now env based on DEPLOY_STAGE
const nermanEmojiId =
   process.env.DEPLOY_STAGE === 'development'
      ? process.env.DEVNERMAN_EMOJI_ID
      : process.env.TESTNERMAN_EMOJI_ID;

module.exports = {
   name: 'messageReactionAdd',
   async execute(reaction, user) {
      //reaction.message.guild.roles.cache.forEach(role => console.log(role.name, role.id)) //prints all rolls
      //"@everyone" is default role

      Logger.info(
         'events/messageReactionAdd.js: Handling reaction added event.',
         {
            emoji: reaction.emoji,
            count: reaction.count,
            authorId: reaction.message.author.id,
         },
      );

      const {
         emoji,
         count,
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

      try {
         if (stahp === true) {
            Logger.info(
               'events/messageReactionAdd.js: In development mode, so exiting function.',
               {
                  emoji: reaction.emoji,
                  count: reaction.count,
                  authorId: reaction.message.author.id,
               },
            );
            return;
         }

         // if (process.env.DEPLOY_STAGE === 'staging') return;
         if (emojiId !== nermanEmojiId) {
            Logger.info(
               "events/messageReactionAdd.js: Emoji ID does not match Nerman's emoji ID, so leaving.",
               {
                  emoji: reaction.emoji,
                  count: reaction.count,
                  authorId: reaction.message.author.id,
                  deployStage: process.env.DEPLOY_STAGE,
               },
            );
            return;
         } else {
            Logger.debug(
               "events/messageReactionAdd.js: Emoji ID matches Nerman's emoji ID.",
               {
                  emoji: reaction.emoji,
                  count: reaction.count,
                  authorId: reaction.message.author.id,
                  deployStage: process.env.DEPLOY_STAGE,
               },
            );
         }

         const authorName = membersCache.get(id).nickname ?? username;

         // return;

         // below code to calculate voteThreshold should be refactored with threshold.js code into nThreshold.js

         // const Role = rolesCache.find(role => role.name == 'Voters');
         const Role = rolesCache.find(role => role.id === allowedRoles);

         //disabled - writing a new temporary one to use below, const nouncillors
         // let votersOnline = membersCache
         //    .filter(member => member.presence?.status == 'online')
         //    .filter(member => member.roles.cache.find(role => role == Role)).size;

         const nouncillors = membersCache.filter(member =>
            member.roles.cache.find(role => role == Role),
         ).size;

         // disabled - writing a temporary new version below
         // let voteThreshold = nThreshold.getThreshold(votersOnline);

         const voteThreshold = Math.ceil(nouncillors * 0.03);

         Logger.debug(
            'events/messageReactionAdd.js: Checking vote threshold.',
            {
               emoji: reaction.emoji,
               count: reaction.count,
               authorId: reaction.message.author.id,
               voteThreshold: voteThreshold,
            },
         );

         let msgAttachmentUrls = [];

         let mappedMentions = {};
         // let mentions = reaction.message.mentions.members;

         mentionsMembers.forEach(mention => {
            mappedMentions[mention.user.id] =
               mention.nickname ?? mention.user.username;
         });

         // enabled
         let tweetContent = await nTwitter.formatTweet(
            content,
            authorName,
            mappedMentions,
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
         // enabled
         if (
            !messageTweeted &&
            emojiId === nermanEmojiId &&
            reaction.count >= voteThreshold
         ) {
            nTwitter.post(tweetContent, msgAttachmentUrls);

            // mark message with NermanBlast emoji
            await reaction.message.react('932664888642400276');
         }

         Logger.info(
            'events/messageReactionAdd.js: Finished handling reaction added event.',
            {
               emoji: reaction.emoji,
               count: reaction.count,
               authorId: reaction.message.author.id,
            },
         );
      } catch (error) {
         Logger.error('events/messageReactionAdd.js: Received an error.', {
            error: error,
         });
      }
   },
};
