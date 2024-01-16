const { EmbedBuilder, hyperlink } = require('discord.js');

/**
 * @param {{
 *  text: string,
 *  author: string,
 * 	event: {
 *		hash: string,
 *		fid: number
 *  }
 * }} data
 */
exports.generateNounsCastEmbed = function (data) {
   const title = 'Farcaster | New Nouns Cast!';

   const url = `https://warpcast.com/${data.author}/${data.event.hash}`;
   const author = hyperlink(data.author, `https://warpcast.com/${data.author}`);

   const description = data.text + `\n\n— ${author}`;

   return new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);
};
