const { MessageEmbed, Message } = require('discord.js');
const { inlineCode } = require('@discordjs/builders');

const Poll = require('../../../db/schemas/Poll');

const shortenAddress = require('../../../helpers/nouns/createNounEmbed');
const Logger = require('../../../helpers/logger');

const nounsGovId = process.env.NOUNS_GOV_ID;

module.exports = {
   name: 'propStatusChange',
   /**
    * @param {Message} interaction
    */
   async execute(message, statusChange, data) {
      try {
         Logger.info(
            'events/stateOfNouns/propStatusChange.js: Handling a proposal change event.',
            {
               proposalId: `${data.id}`,
            },
         );

         const {
            channelId,
            guildId,
            guild: {
               channels,
               channels: { cache },
            },
         } = message;

         const { id: proposalId } = data;

         const propRegExp = new RegExp(`^prop\\s${Number(proposalId)}`, 'i');

         // const targetPolls = await Poll.find({
         //    'pollData.title': { $regex: propRegExp },
         // });
         // Poll.find({ 'pollData.title': { $regex: propRegExp })
         const targetPoll = await Poll.findOne({
            'pollData.title': { $regex: propRegExp },
         })
            .populate('config')
            .exec();

         const titleFromFindOne = targetPoll.pollData.title;

         Logger.debug(
            "events/stateOfNouns/propStatusChange.js: Checking the target poll's title.",
            {
               title: titleFromFindOne,
               poll: targetPoll,
            },
         );

         // !testing conditional , will use empty var instead
         // const voteEmbedFindOne = new MessageEmbed()
         let voteEmbedFindOne;

         if (channelId !== process.env.AGORA_CHANNEL_ID) {
            voteEmbedFindOne = new MessageEmbed()
               .setColor('#000000')
               .setTitle(titleFromFindOne)
               .setDescription(
                  `https://www.nounsagora.com/proposals/${proposalId}\n${statusChange}`,
               );
         } else {
            voteEmbedFindOne = new MessageEmbed()
               .setColor('#000000')
               .setTitle(titleFromFindOne)
               .setDescription(
                  `https://nouns.wtf/vote/${proposalId}\n${statusChange}`,
               );
         }

         if (guildId === process.env.DISCORD_GUILD_ID) {
            const propChannel =
               (await cache.get(targetPoll.config.channelId)) ??
               (await channels.fetch(targetPoll.config.channelId));

            const propMessage = await propChannel.messages.fetch(
               targetPoll.messageId,
            );

            const messageThread = await propMessage.thread.fetch();

            const pollThreadEmbed = new MessageEmbed()
               .setColor('#00FFFF')
               .setDescription(
                  `Proposal status changed to ${inlineCode(statusChange)}`,
               );

            await messageThread.send({ embeds: [pollThreadEmbed] });
         }

         await message.edit({
            content: null,
            embeds: [voteEmbedFindOne],
         });

         Logger.info(
            'events/stateOfNouns/propStatusChange.js: Finished handling a proposal change event.',
            {
               proposalId: `${data.id}`,
            },
         );
      } catch (error) {
         Logger.error(
            'events/stateOfNouns/propStatusChange.js: Received an error.',
            {
               error: error,
            },
         );
      }
   },
};
