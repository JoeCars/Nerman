const { MessageEmbed, Channel } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');

const { log: l } = console;

module.exports = {
   name: 'auctionCreated',
   /**
    *
    * @param {Channel} genChannel
    */
   async execute(genChannel, data) {
      try {
         l('AUCTION CREATED EVENT HANDLER');

         const { id, startTime, endTime } = data;

         l({ genChannel });
         l({ data });
         l({ id, startTime, endTime });

         const nounsWTF = hyperlink(
            'Nouns.wtf',
            `https://nouns.wtf/noun/${id}`
         );
         const pronouns = hyperlink(
            'Pronouns.gg',
            `https://pronouns.gg/noun/${id}`
         );
         const nounOClock = hyperlink(
            'Nounoclock.app',
            `https://www.nounoclock.app/`
         );

         const acEmbed = new MessageEmbed()
            .setColor('#00FFFF')
            .setTitle(`New Auction | Noun ${id}`)
            .setDescription(`${nounsWTF}\n${pronouns}\n${nounOClock}`)
            .setImage(`https://noun.pics/${tokenId}.png`);

         return await genChannel.send({ embeds: [acEmbed] });
      } catch (error) {
         console.error(error);
      }
   },
};
