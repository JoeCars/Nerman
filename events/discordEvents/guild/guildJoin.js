const { Guild } = require('discord.js');
const { Types } = require('mongoose');

const GuildConfig = require('../../../db/schemas/GuildConfig');
const Logger = require('../../../helpers/logger');

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

      let gConfigDoc;

      if (!guildConfigs.has(guildId) || guildConfigs.get(guildId) === null) {
         Logger.info(
            `events/guild/guildJoin.js: guildConfig does not exist, attempting to create new one for guildId ${guildId} => `,
            { gConfigDoc },
         );
         try {
            Logger.info(
               'events/guild/guildJoin.js: logging to see if trycatch scope is interfering with accessing guildId',
               { guildId: guildId ?? 'No id accessible' },
            );
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
