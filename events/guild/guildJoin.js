const { Guild } = require('discord.js');
const { log: l} = console;

module.exports = {
   name: 'guildCreate',
   /**
    *
    * @param {Guild} guild
    */
   async execute(guild) {
      console.log('NEW GUILD JOINED', guild);
   },
};
