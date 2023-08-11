const { ThreadChannel } = require('discord.js');
const UrlConfig = require('../../../../db/schemas/UrlConfig');
const {
   generatePropCreatedEmbed,
} = require('../../../../views/embeds/propCreated');
const {
   generatePropStatusChangeEmbed,
} = require('../../../../views/embeds/propStatusChange');
const {
   generatePropVoteCastEmbed,
} = require('../../../../views/embeds/propVoteCast');
const Logger = require('../../../../helpers/logger');

module.exports = {
   name: 'nounsForumUpdate',

   /**
    *
    * @param {ThreadChannel} thread
    * @param {{nounsForumType: string}} data
    */
   async execute(thread, data) {
      const propUrl = (await UrlConfig.fetchUrls(thread.guildId)).propUrl;
      let embed = undefined;
      if (data.nounsForumType === 'PropVoteCast') {
         embed = generatePropVoteCastEmbed(data, propUrl);
      } else if (data.nounsForumType === 'PropCreated') {
         embed = generatePropCreatedEmbed(data, propUrl);
      } else if (data.nounsForumType === 'PropStatusChange') {
         embed = generatePropStatusChangeEmbed(data, propUrl);
      } else {
         throw new Error('Data does not match any known type.');
      }

      thread.send({
         embeds: [embed],
      });

      Logger.info('Successfully send thing.');
   },
};
