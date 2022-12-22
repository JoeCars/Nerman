const { MessageEmbed, Message } = require('discord.js');

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

         // const Nouns = await message.client.libraries.get('Nouns');
         const nounsGovChannel = await cache.get(nounsGovId);

         l({ nounsGovChannel });
         l({ message });
         l({ proposal });

         l({ proposalId, title, description });

         const titleHyperlink = `[${title}](https://nouns.wtf/vote/${proposalId})`;
         const shortDescription = `${description.substring(0, 200)}...`;
         const readMoreHyperlink = `[Read Full Proposal](https://nouns.wtf/vote/${proposalId})`;

         l({ titleHyperlink, shortDescription, readMoreHyperlink });

         const propCreatedEmbed = new MessageEmbed()
            .setTitle(titleHyperlink)
            .setDescription(`${shortDescription}\n--> ${readMoreHyperlink}`);
         // return await message.edit({ content: null, embeds: [voteEmbedFind] });
         return await message.edit({
            content: null,
            embeds: [propCreatedEmbed],
         });
      } catch (error) {
         console.error(error);
      }
   },
};
