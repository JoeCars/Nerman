const { MessageEmbed, Message } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');

const Logger = require('../../helpers/logger');

const nounsGovId = process.env.NOUNS_GOV_ID;

module.exports = {
   name: 'propCreated',
   /**
    * @param {Message} interaction
    */
   async execute(message, proposal, proposalId) {
      try {
         Logger.info(
            'events/stateOfNouns/propCreated.js: Handling a proposal creation event.',
            {
               proposalId: `${proposalId}`,
               proposalTitle: proposal.pollData.title,
               proposalDescription: proposal.pollData.description,
            }
         );

         const {
            guild: {
               channels: { cache },
            },
         } = message;

         const {
            pollData: { title, description },
         } = proposal;

         const nounsGovChannel = await cache.get(nounsGovId);

         const propUrl = `https://nouns.wtf/vote/${proposalId}`;
         const titleHyperlink = hyperlink(title, propUrl);
         const shortDescription = `${description.substring(0, 200)}...`;
         const readMoreHyperlink = hyperlink('Read Full Propposal', propUrl);

         Logger.debug(
            'events/stateOfNouns/propCreated.js: Checking description.',
            {
               proposalId: `${proposalId}`,
               proposalTitle: proposal.pollData.title,
               proposalDescription: proposal.pollData.description,
               shortDescription: shortDescription,
               readMoreHyperlink: readMoreHyperlink,
            }
         );

         const propCreatedEmbed = new MessageEmbed()
            .setTitle(title)
            .setURL(propUrl)
            .setDescription(`${shortDescription}\n\n--> ${readMoreHyperlink}`);

         Logger.info(
            'events/stateOfNouns/propCreated.js: Successfully handled a proposal creation event.',
            {
               proposalId: `${proposalId}`,
               proposalTitle: proposal.pollData.title,
               proposalDescription: proposal.pollData.description,
            }
         );

         return await message.edit({
            content: null,
            embeds: [propCreatedEmbed],
         });
      } catch (error) {
         Logger.error(
            'events/stateOfNouns/propCreated.js: Received an error.',
            {
               error: error,
            }
         );
      }
   },
};
