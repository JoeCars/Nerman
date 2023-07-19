const { MessageEmbed, TextChannel } = require('discord.js');

const Poll = require('../../../db/schemas/Poll');

const Logger = require('../../../helpers/logger');
const {
   createProposalStatusEmbed,
} = require('../../../helpers/proposalHelpers');
const UrlConfig = require('../../../db/schemas/UrlConfig');

module.exports = {
   name: 'propStatusChange',
   /**
    * @param {TextChannel} channel
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

         const urls = await UrlConfig.fetchUrls(channel.guildId);

         const voteEmbedFindOne = new MessageEmbed()
            .setColor('#000000')
            .setTitle(titleFromFindOne)
            .setDescription(`${urls.propUrl}${proposalId}\n${statusChange}`);

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
