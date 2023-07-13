const nThreshold = require(`../../../helpers/twitter/nThreshold.js`);
const Logger = require('../../../helpers/logger.js');
const { isUserAuthorized } = require('../../../helpers/authorization');

module.exports = {
   subCommand: 'nerman.threshold',
   async execute(interaction) {
      Logger.info(
         'commands/nerman/info/threshold.js: Starting to retrieve threshold.',
      );

      const guildUser = await interaction.guild.members.fetch(
         interaction.user.id,
      );
      if (!isUserAuthorized(2, guildUser)) {
         throw new Error('This is an admin-only command');
      }

      let votingRole = 'Voters';

      const Role = interaction.guild.roles.cache.find(
         role => role.name == votingRole,
      );
      let votersOnline = interaction.guild.members.cache
         .filter(member => member.presence?.status == 'online')
         .filter(member => member.roles.cache.find(role => role == Role)).size;
      let voteThreshold = nThreshold.getThreshold(votersOnline);

      await interaction.reply(
         votersOnline +
            ' voters online. Message will be tweeted at ' +
            voteThreshold +
            ' Nerman emoji(s).',
      );

      Logger.info(
         'commands/nerman/info/threshold.js: Finished retrieving threshold.',
      );
   },
};
