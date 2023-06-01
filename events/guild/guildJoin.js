const { Guild } = require('discord.js');
const { Types } = require('mongoose');
const GuildConfig = require('../../db/schemas/GuildConfig');
const Logger = require('../../helpers/logger');

module.exports = {
   name: 'guildCreate',
   /**
    *
    * @param {Guild} guild
    */
   async execute(guild) {
      const {
         id: guildId,
         client: { guildConfigs },
      } = guild;

      Logger.info('events/guild/guildJoin.js: Joining guild.', {
         guildId: guildId,
      });

      // TESTING GUILD ID: 783406052372643940

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

      //       if (!guildWhitelist.includes(guildId)) {
      //          Logger.debug(
      //             'events/guild/guildJoin.js: The guild is not white-listed. Leaving the guild.',
      //             {
      //                guildId,
      //             }
      //          );
      //       }

      let gConfigDoc;

      if (!guildConfigs.has(guildId) || guildConfigs.get(guildId) === null) {
         Logger.info(
            `events/guild/guildJoin.js: guildConfig does not exist, attempting to create new one for guildId ${guildId} => `,
            { gConfigDoc },
         );
         try {
            gConfigDoc =
               (await GuildConfig.findGuildConfig(guildId)) ??
               (await GuildConfig.create(
                  {
                     _id: new Types.ObjectId(),
                     guildId,
                  },
                  { new: true },
               ));
            Logger.info(
               'events/guild/guildJoin.js: gConfigDoc created, new Doc => ',
               { gConfigDoc },
            );
         } catch (error) {
            Logger.error('events/guild/guildJoin.js: Error.', { error: error });
         }
      } else {
         Logger.info('gConfig exists', { gConfig: guildConfigs.get(guildId) });
         gConfigDoc = guildConfigs.get(guildId);
      }

      Logger.info('gConfig exists', { gConfig: guildConfigs.get(guildId) });

      try {
         guildConfigs.set(guildId, gConfigDoc);
      } catch (error) {
         Logger.error('Error setting guildConfigs', { error });
      }

      Logger.info(
         'events/guild/guildJoin.js: Checking guild configurations. Finished joining guild.',
         {
            gConfigDoc: gConfigDoc,
            guildConfigs: guildConfigs,
            guildId: guild.id,
         },
      );
   },
};
