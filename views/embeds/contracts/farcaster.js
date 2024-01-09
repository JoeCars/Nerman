const { EmbedBuilder } = require('discord.js');

/**
 * @param {{
 *  text: string,
 * 	event: {
 *		hash: string,
 *		fid: number
 *  }
 * }} data
 */
exports.generateNounsCastEmbed = function (data) {
   const title = 'Farcaster | New Nouns Cast!';

   return new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(data.text);
};
