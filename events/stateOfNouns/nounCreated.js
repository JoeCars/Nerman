const { MessageEmbed, Channel } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');

const Logger = require('../../helpers/logger.js');

module.exports = {
   name: 'nounCreated',
   /**
    *
    * @param {Channel} nogglesChannel
    */
   async execute(nogglesChannel, data) {
      try {
         const { id } = data;

         Logger.info('nounCreated.js', {
            nounId: `${data.id}`,
            nogglesChannel: nogglesChannel,
         });

         const title = `Noun Created | Noun ${id}`;

         const titleUrl = `https://nouns.wtf/noun/${id}`;

         const ncEmbed = new MessageEmbed()
            .setColor('#00FFFF')
            .setTitle(title)
            .setURL(titleUrl)
            .setDescription(
               `${id % 10 !== 0 ? 'Auction Created' : "Nounder's Noun"}`,
            )
            .setImage(`https://noun.pics/${id}.png`);

         Logger.info('nounCreated.js => Embed Data', {
            title: title,
            titleUrl: titleUrl,
            embedObject: ncEmbed,
         });

         return await nogglesChannel.send({ embeds: [ncEmbed] });
      } catch (error) {
         console.error(error);
      }
   },
};
