const { MessageEmbed } = require('discord.js');

// TODO: Update image if the new nouns look different.
exports.generateForkAuctionCreatedEmbed = function (data) {
   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(`Fork 0 | New Auction | Noun ${data.id}`)
      .setImage(`http://noun.pics/${data.id}.png`);

   return embed;
};
