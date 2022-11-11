const { CommandInteraction } = require('discord.js');
const { log: l } = console;
const guildAdminId = process.env.NERMAN_G_ADMIN_ID;
// const { lc } = require('../../../utils/functions');
module.exports = {
   subCommand: 'nerman.admin-check-voters',
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      const {
         channelId,
         member: {
            roles: { cache: userRoleCache },
         },
         guild: {
            members: guildMembers,
            members: { cache: mCache },
         },
      } = interaction;

      await interaction.deferReply({ ephemeral: true });

      if (!userRoleCache.has(guildAdminId))
         throw new Error('This is an admin-only command');

      const checkingRole = interaction.options.getString('role-name');

      let fetchedMembers = await guildMembers.fetch();

      l(fetchedMembers.length);

      if (checkingRole !== null) {
         l('ROLE FILTER START');

         fetchedMembers = fetchedMembers.filter(member => {
            l('Member:');
            l(member.user.username);
            // l(member.roles.cache);
            l(!!member.roles.cache.find(role => role.name === checkingRole));
            // l(member.roles.cache.name);

            return member.roles.cache.find(role => role.name === checkingRole);
         });

         l('ROLE FILTER END');
      }

      // l({ interaction });
      l({ checkingRole });
      // l({ userRoleCache });

      // l({ mCache });
      // l({ fetchedMembers });

      // let userArray = [];

      // fetchedMembers.forEach(
      l('PROMISES MAP START');
      const promises = await fetchedMembers.map(
         ({ id, nickname, user: { username, discriminator } }) => {
            // l({
            //    id,
            //    nickname,
            //    username,
            //    discriminator,
            //    fullName:
            //       nickname !== null
            //          ? `${nickname}#${discriminator}`
            //          : `${username}#${discriminator}`,
            // });

            return {
               id,
               nickname,
               username,
               discriminator,
               fullName:
                  nickname !== null
                     ? `${nickname}#${discriminator}`
                     : `${username}#${discriminator}`,
            };
         }
      );

      const userArray = await Promise.all(promises);

      l(JSON.stringify(userArray, null, 4));
      l('userArray.length', userArray.length);

      l('PROMISES MAP END');
      await interaction.editReply({
         content: 'Logging information to console.',
      });
   },
};
