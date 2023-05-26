const { MessageEmbed, Channel } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');

const { log: l } = console;

module.exports = {
   name: 'nounCreated',
   /**
    *
    * @param {Channel} nogglesChannel
    */
   async execute(nogglesChannel, data) {
      try {
         l('NOUN CREATED EVENT HANDLER');

         const { id } = data;

         l({ nogglesChannel });
         l({ data });
         // l({ id, startTime, endTime });

         const title = `Noun Created | Noun ${id}`;

         const titleUrl = `https://nouns.wtf/noun/${id}`;

         const ncEmbed = new MessageEmbed()
            .setColor('#00FFFF')
            .setTitle(title)
            .setURL(titleUrl)
            .setDescription(
               `${id % 10 !== 0 ? 'Auction Created' : "Nounder's Noun"}`
            )
            .setImage(`https://noun.pics/${id}.png`);

         l({ ncEmbed });

         return await nogglesChannel.send({ embeds: [ncEmbed] });
      } catch (error) {
         console.error(error);
      }
   },
};
