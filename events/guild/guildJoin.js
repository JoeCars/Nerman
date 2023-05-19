const { Guild } = require('discord.js');
const { Types } = require('mongoose');
const GuildConfig = require('../../db/schemas/GuildConfig');
const { log: l } = console;

module.exports = {
   name: 'guildCreate',
   /**
    *
    * @param {Guild} guild
    */
   async execute(guild) {
      // TESTING GUILD ID: 783406052372643940
      const {
         id: guildId,
         client: { guildConfigs },
      } = guild;

      // todo this is temporary until I can just add a proper whitelist env to heroku, which first requires a (now) mandatory 2FA to log in, which I need Joel to handle.
      // const guildWhitelist =
      //    process.env.NODE_ENV === 'development'
      //       ? process.env.GUILD_ID_WHITELIST.split(',')
      //       : ['919783277726957599', '992462546860785778'];

      // const guildWhitelist = process.env.GUILD_ID_WHITELIST.split(',');

      // l({ guildWhitelist });
      // l('CLIENT', guild.client);
      // l('NEW GUILD JOINED', guild);
      // l('NEW GUILD ID:', guildId);

      // l('CHANNELS', channels.cache);

      // if (!guildWhitelist.includes(guildId)) {
      //    l('THIS GUILD IS FULL OF STUPID POSEURS!');
      //    l('LEAVING GUILD...');

      //    return await guild.leave();
      // }

      l('THIS GUILD IS WHITELISTED');

      l({ guild });
      l({ guildConfigs });

      let gConfigDoc;

      if (!guildConfigs.has(guildId)) {
         try {
            gConfigDoc =
               (await GuildConfig.findGuildConfig(guildId)) ??
               (await GuildConfig.create({
                  _id: new Types.ObjectId(),
                  guildId,
               }));
         } catch (error) {
            l({ error });
         }
      } else {
         gConfigDoc = guildConfigs.get(guildId);
      }

      l({ gConfigDoc });

      guildConfigs.set(guildId, gConfigDoc);

      l({ guildConfigs });

      // await guild.leave();
   },
};
