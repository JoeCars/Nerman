const { Guild } = require('discord.js');
const Logger = require('../../helpers/logger');

module.exports = {
   name: 'guildDelete',
   /**
    *
    * @param {Guild} guild
    */
   async execute(guild) {
      // TESTING GUILD ID: 783406052372643940
      const { id: guildId } = guild;
      Logger.info('events/guild/guildLeave.js: Leaving guild.', {
         guildId,
      });
   },
};
