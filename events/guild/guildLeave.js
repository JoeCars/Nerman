const { Guild } = require('discord.js');
const { log: l } = console;

module.exports = {
   name: 'guildDelete',
   /**
    *
    * @param {Guild} guild
    */
   async execute(guild) {
      // TESTING GUILD ID: 783406052372643940
      const { id: guildId } = guild;

      l('CLIENT', guild.client);
      l('GUILD LEFT', guild);
      l('GUILD LEFT ID:', guildId);

      // if (!guildWhitelist.includes(guildId)) {
      // l('THIS GUILD IS FULL OF STUPID POSEURS!');
      // l('DESTROYING CONNECTTION...');

      // guild.client.destroy();
      // } else {
      // l('THIS GUILD IS WHITELISTED');
      // }
   },
};
