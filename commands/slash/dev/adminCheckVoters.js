const { CommandInteraction } = require('discord.js');

const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

module.exports = {
   subCommand: 'dev.admin-check-voters',
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/slash/dev/adminCheckVoter.js: Attempting to check voters.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
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

      await authorizeInteraction(interaction, 4);

      const userArray = await constructUserData(guildMembers, interaction);

      await interaction.editReply({
         content: 'Logging information to console.',
      });

      Logger.info(
         'commands/slash/dev/adminCheckVoter.js: Finished checking voters.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userArray: userArray,
         },
      );
   },
};

async function constructUserData(guildMembers, interaction) {
   let fetchedMembers = await guildMembers.fetch();

   // Sometimes a specific role is checked via command.
   const checkingRole = interaction.options.getString('role-name');
   if (checkingRole !== null) {
      fetchedMembers = fetchedMembers.filter(member => {
         return member.roles.cache.find(role => role.name === checkingRole);
      });
   }

   return fetchedMembers.map(
      ({ id, nickname, user: { username, discriminator } }) => {
         return {
            discordId: id,
            fullNickname:
               nickname !== null
                  ? `${nickname}#${discriminator}`
                  : `${username}#${discriminator}`,
            fullUsername: `${username}#${discriminator}`,
         };
      },
   );
}
