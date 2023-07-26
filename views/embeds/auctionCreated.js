const { MessageEmbed } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');

exports.generateAuctionCreatedEmbed = function (data) {
   const nounsWTF = hyperlink('Nouns.wtf', `https://nouns.wtf/noun/${data.id}`);
   const pronouns = hyperlink(
      'Pronouns.gg',
      `https://pronouns.gg/noun/${data.id}`,
   );
   const nounOClock = hyperlink(
      'Nounoclock.app',
      `https://www.nounoclock.app/`,
   );

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(`New Auction | Noun ${data.id}`)
      .setDescription(`${nounsWTF}\n${pronouns}\n${nounOClock}`)
      .setImage(`https://noun.pics/${data.id}.png`);

   return embed;
};
