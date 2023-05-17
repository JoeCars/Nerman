const { CommandInteraction } = require('discord.js');

const Logger = require('../../../helpers/logger');

// const guildAdminId = process.env.NERMAN_G_ADMIN_ID;
const authorizedIds = process.env.BAD_BITCHES.split(',');
// const { lc } = require('../../../utils/functions');
module.exports = {
   subCommand: 'nerman.admin-check-voters',
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/nerman/info/adminCheckVoter.js: Attempting to admin check votes.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         }
      );

      const {
         channelId,
         user: { id: userId },
         member: {
            roles: { cache: userRoleCache },
         },
         guild: {
            members: guildMembers,
            members: { cache: mCache },
         },
      } = interaction;

      await interaction.deferReply({ ephemeral: true });

      // disabled until we figure out guild permission admin stuff yadda yaddda
      // if (!userRoleCache.has(guildAdminId))
      if (!authorizedIds.includes(userId)) {
         throw new Error('This is an admin-only command');
      }

      const checkingRole = interaction.options.getString('role-name');

      let fetchedMembers = await guildMembers.fetch();

      if (checkingRole !== null) {
         Logger.info(
            'commands/nerman/info/adminCheckVoter.js: Starting role filter.',
            {
               userId: interaction.user.id,
               guildId: interaction.guildId,
               channelId: interaction.channelId,
            }
         );

         fetchedMembers = fetchedMembers.filter(member => {
            return member.roles.cache.find(role => role.name === checkingRole);
         });

         Logger.info(
            'commands/nerman/info/adminCheckVoter.js: Finished role filter.',
            {
               userId: interaction.user.id,
               guildId: interaction.guildId,
               channelId: interaction.channelId,
            }
         );
      }

      Logger.info(
         'commands/nerman/info/adminCheckVoter.js: Starting promises map',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         }
      );

      const promises = await fetchedMembers.map(
         ({ id, nickname, user: { username, discriminator } }) => {
            return {
               discordId: id,
               fullNickname:
                  nickname !== null
                     ? `${nickname}#${discriminator}`
                     : `${username}#${discriminator}`,
               fullUsername: `${username}#${discriminator}`,
            };
         }
      );

      const userArray = await Promise.all(promises);

      Logger.info(
         'commands/nerman/info/adminCheckVoter.js: Finished promises map',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userArray: userArray,
         }
      );

      await interaction.editReply({
         content: 'Logging information to console.',
      });

      Logger.info(
         'commands/nerman/info/adminCheckVoter.js: Finished admin check votes.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         }
      );
   },
};
