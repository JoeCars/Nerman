const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const { generateNewPostEmbed } = require('../../../views/embeds/nounsNymzPost');

module.exports = {
   name: 'newPost',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, post) {
      const nouns = channel.client.libraries.get('Nouns');
      const embed = await generateNewPostEmbed(post, nouns);
      await channel.send({ embeds: [embed] });

      Logger.info(
         'events/customevents/nouns/newPost.js: Finished sending NounsNymz post.',
         {
            postId: post.id,
            postTitle: post.title,
            channelId: channel.id,
         },
      );
   },
};
