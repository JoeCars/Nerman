const { CommandInteraction } = require('discord.js');
const { codeBlock } = require('@discordjs/builders');

const { Types } = require('mongoose');
const User = require('../../../db/schemas/User');
const Poll = require('../../../db/schemas/Poll');
const PollChannel = require('../../../db/schemas/PollChannel');

const { log: l } = console;
module.exports = {
   subCommand: 'nerman.participation',
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      const {
         channelId,
         channel: {
            name: channelName,
            members: { cache: cmCache },
         },
         guild: {
            members: { cache: mCache },
         },
      } = interaction;

      const configExists = await PollChannel.configExists(channelId);

      if (!configExists) {
         throw new Error(
            'There are no configurations registered to this channel. You may only register from a channel in which polling has been configured.'
         );
         // return interaction.reply({
         //    content:
         //       'There are no configurations registered to this channel. You may only register from a channel in which polling has been configured.',
         //    ephemeral: true,
         // });
      }

      const voterId = interaction.options.getString('discord-id');
      const {
         nickname,
         user: { username, discriminator },
      } = mCache.get(voterId);

      const voterDoc = await User.findOne().byDiscordId(voterId).exec();
      const { eligiblePolls: witnessed, participatedPolls: participated } =
         voterDoc.eligibleChannels.get(channelId);

      l({ witnessed, participated });

      const {
         roles: { cache: memberRoles },
      } = await mCache.get(voterId);

      if (!voterDoc) {
         l('[...memberRoles.keys()]', [...memberRoles.keys()]);

         const hasVotingRole = await User.checkVotingRoles(memberRoles);

         console.log({ hasVotingRole });

         if (!hasVotingRole)
            throw new Error(
               'This member has no voting roles. Their participation can not be gauged, because they are unable to participate.'
            );

         const eligibleChannels = await User.findEligibleChannels(memberRoles);

         const newUser = await User.createUser(voterId, eligibleChannels);
         l({ newUser });

         const participation = await newUser.participation(channelId);

         const header = `**#${channelName} | ${
            nickname ?? username
         }#${discriminator} vote participation**\n`;

         const stats = codeBlock(
            `${witnessed} votes witnessed\n${participated} votes participated\n${participation} participation rate`
         );

         const response = `${header}${stats}`;

         return interaction.reply({
            content: response,
            ephemeral: true,
         });
      } else {
         const participation = await voterDoc.participation(channelId);

         const header = `**#${channelName} | ${
            nickname ?? username
         }#${discriminator} vote participation**\n`;

         const stats = codeBlock(
            `${witnessed} votes witnessed\n${participated} votes participated\n${participation} participation rate`
         );

         const response = `${header}${stats}`;

         interaction.reply({ content: response, ephemeral: true });
      }
   },
};
