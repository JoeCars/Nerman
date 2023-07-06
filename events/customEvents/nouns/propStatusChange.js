const { MessageEmbed, TextChannel } = require('discord.js');
const { inlineCode } = require('@discordjs/builders');

const Poll = require('../../../db/schemas/Poll');

const Logger = require('../../../helpers/logger');
const {
   createProposalStatusEmbed,
} = require('../../../helpers/proposalHelpers');

module.exports = {
   name: 'propStatusChange',
   /**
    * @param {TextChannel} interaction
    */
   async execute(channel, data) {
      try {
         Logger.info(
            'events/nouns/propStatusChange.js: Handling a proposal change event.',
            {
               proposalId: `${data.id}`,
               status: data.status,
            },
         );

         const statusChange = data.status;

         const statusEmbed = await createProposalStatusEmbed(
            data,
            statusChange,
         );

         const message = await channel.send({
            content: null,
            embeds: [statusEmbed],
         });

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
            "events/nouns/propStatusChange.js: Checking the target poll's title.",
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

         await message.edit({
            content: null,
            embeds: [voteEmbedFindOne],
         });

         Logger.info(
            'events/nouns/propStatusChange.js: Finished handling a proposal change event.',
            {
               proposalId: `${data.id}`,
            },
         );
      } catch (error) {
         Logger.error('events/nouns/propStatusChange.js: Received an error.', {
            error: error,
         });
      }
   },
};
