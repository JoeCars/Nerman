const { ThreadChannel } = require('discord.js');
const UrlConfig = require('../../../../db/schemas/UrlConfig');
const {
   generatePropCreatedEmbed,
} = require('../../../../views/embeds/propCreated');
const Logger = require('../../../../helpers/logger');

module.exports = {
   name: 'lilnounsForumUpdate',

   /**
    *
    * @param {ThreadChannel} thread
    * @param {{nounsForumType: string}} data
    */
   async execute(thread, data) {
      // const propUrl = (await UrlConfig.fetchUrls(thread.guildId)).propUrl;
      const propUrl = 'https://lilnouns.wtf/vote/';
      let embed = undefined;

      switch (data.nounsForumType) {
         case 'PropCreated':
            embed = generatePropCreatedEmbed(data, propUrl);
            break;
         default:
            Logger.error('events/lilnounsForumUpdate.js: Unknown data type.', {
               data: data,
               threadId: thread.id,
               guildId: thread.guildId,
            });
            throw new Error('Data does not match any known type.');
      }

      thread
         .send({
            embeds: [embed],
         })
         .catch(error => {
            Logger.error('events/lilnounsForumUpdate.js: Cannot send embed.', {
               error: error,
               threadId: thread.id,
               guildId: thread.guildId,
            });
         });

      Logger.info('Successfully sent forum embed.');
   },
};
