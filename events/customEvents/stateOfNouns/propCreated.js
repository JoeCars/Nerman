const { MessageEmbed, Message } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');

const { log: l } = console;

const nounsGovId = process.env.NOUNS_GOV_ID;

module.exports = {
   name: 'propCreated',
   /**
    * @param {Message} interaction
    */
   async execute(message, proposal, proposalId) {
      try {
         l('PROP CREATED EVENT HANDLER');


         const {
            guild: {
               channels: { cache },
            },
         } = message;

         const {
            pollData: { title, description },
         } = proposal;
         l('PROP CREATED EVENT HANDLER');

         const nounsGovChannel = await cache.get(nounsGovId);

         l({ nounsGovChannel });
         l({ message });
         l({ proposal });

         l({ proposalId, title, description });

         const propUrl = `https://nouns.wtf/vote/${proposalId}`;
         const titleHyperlink = hyperlink(title, propUrl);
         const shortDescription = `${description.substring(0, 200)}...`;
         const readMoreHyperlink = hyperlink('Read Full Propposal', propUrl);

         l({ shortDescription, readMoreHyperlink });

         const propCreatedEmbed = new MessageEmbed()
            .setTitle(title)
            .setURL(propUrl)
            .setDescription(`${shortDescription}\n\n--> ${readMoreHyperlink}`);

         return await message.edit({
            content: null,
            embeds: [propCreatedEmbed],
         });
      } catch (error) {
         console.error(error);
      }
   },
};
