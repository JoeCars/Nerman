const { MessageEmbed } = require('discord.js');

exports.generateNounCreatedEmbed = function (data) {
   const title = `Noun Created | Noun ${data.id}`;

   const titleUrl = `https://nouns.wtf/noun/${data.id}`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setURL(titleUrl)
      .setDescription(
         `${data.id % 10 !== 0 ? 'Auction Created' : "Nounder's Noun"}`,
      )
      .setImage(`http://noun.pics/${data.id}.png`);

   return embed;
};
