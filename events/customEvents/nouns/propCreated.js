const { MessageEmbed, TextChannel } = require('discord.js');
const { hyperlink, hideLinkEmbed } = require('@discordjs/builders');

const Logger = require('../../../helpers/logger');
const { createNewProposalEmbed } = require('../../../helpers/proposalHelpers');
const UrlConfig = require('../../../db/schemas/UrlConfig');

const titleRegex = new RegExp(/^(#\s(?:\S+\s?)+(?:\S+\n?))/);

module.exports = {
   name: 'propCreated',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, proposal) {
      try {
         const message = await channel.send({
            content: null,
            embeds: [createNewProposalEmbed(proposal)],
         });

         const { id: propId, description } = proposal;

         const title = `${propId}: ${description
            .match(titleRegex)[0]
            .replaceAll(/^(#\s)|(\n+)$/g, '')}`;

         Logger.info(
            'events/nouns/propCreated.js: Handling a proposal creation event.',
            {
               proposalId: `${propId}`,
               proposalTitle: title,
               proposalDescription: description,
            },
            // {
            //    proposalId: `${proposalId}`,
            //    proposalTitle: proposal.pollData.title,
            //    proposalDescription: proposal.pollData.description,
            // }
         );

         // const {
         //    pollData: { title, description },
         // } = proposal;

         // !testing disabling this to try using empty variable and assign based on conditional
         // const propUrl = `https://nouns.wtf/vote/${proposalId}`;
         let propUrl = (await UrlConfig.fetchUrls(channel.guildId)).propUrl;
         propUrl += `${propId}`;

         const shortDescription = `${description.substring(0, 200)}...`;
         // disabled to test Joel's new formatting
         // const readMoreHyperlink = hyperlink('Read Full Proposal', propUrl);
         const readMoreHyperlink = hyperlink(propUrl, propUrl);

         Logger.debug('events/nouns/propCreated.js: Checking description.', {
            proposalId: `${propId}`,
            proposalTitle: title,
            proposalDescription: description,
            shortDescription: shortDescription,
            readMoreHyperlink: readMoreHyperlink,
         });

         // disabled the old embed to try the new one Joel suggested
         // const propCreatedEmbed = new MessageEmbed()
         //    .setTitle(title)
         //    .setURL(propUrl)
         //    .setDescription(`${shortDescription}\n\n--> ${readMoreHyperlink}`);

         const propCreatedEmbed = new MessageEmbed()
            .setColor('#00FFFF')
            .setTitle('New Proposal!')
            .setDescription(`\u200B\n${title}\n\n${hideLinkEmbed(propUrl)}`);
         // .setDescription(`${title}\n\n[${propUrl}](${propUrl})`);
         // .addFields([{ name: '\u200B', value: `[${propUrl}](${propUrl})` }]);

         Logger.info(
            'events/nouns/propCreated.js: Successfully handled a proposal creation event.',
            {
               proposalId: `${propId}`,
               proposalTitle: title,
               proposalDescription: shortDescription,
            },
         );

         return await message.edit({
            content: null,
            embeds: [propCreatedEmbed],
         });
      } catch (error) {
         Logger.error('events/nouns/propCreated.js: Received an error.', {
            error: error,
         });
      }
   },
};
