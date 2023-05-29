const { CommandInteraction } = require('discord.js');
const { codeBlock } = require('@discordjs/builders');

const { Types } = require('mongoose');
const User = require('../../../db/schemas/User');
const Poll = require('../../../db/schemas/Poll');
const PollChannel = require('../../../db/schemas/PollChannel');
const Logger = require('../../../helpers/logger');

module.exports = {
   subCommand: 'nerman.participation',
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/nerman/poll/participation.js: Starting to retrieve poll participation.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         }
      );

      const {
         channelId,
         channel: {
            name: channelName,
            members: { cache: cmCache },
         },
         guild: {
            members,
            id: guildId,
            members: { cache: mCache },
         },
      } = interaction;

      const configExists = await PollChannel.configExists(channelId);

      if (!configExists) {
         throw new Error(
            'There are no configurations registered to this channel. You may only register from a channel in which polling has been configured.'
         );
      }

      // 993371424662224986 nerman-dev-jr
      const voterId =
         interaction.options.getString('discord-id') ??
         interaction.member.user.id;

      const {
         nickname,
         user: { username, discriminator },
         roles: { cache: memberRoles },
      } = mCache.get(voterId) ?? (await members.fetch(voterId));

      const voterDoc = await User.findOne()
         .byDiscordId(voterId, guildId)
         .exec();

      if (!voterDoc) {
         Logger.debug(
            'commands/nerman/poll/participation.js: Checking member role keys',
            {
               userId: interaction.user.id,
               guildId: interaction.guildId,
               channelId: interaction.channelId,
               memberRolesKeys: [...memberRoles.keys()],
            }
         );

         const { eligiblePolls: witnessed, participatedPolls: participated } =
            voterDoc.eligibleChannels.get(channelId);

         const hasVotingRole = await User.checkVotingRoles(memberRoles);
         Logger.debug(
            'commands/nerman/poll/participation.js: Checking voting role',
            {
               userId: interaction.user.id,
               guildId: interaction.guildId,
               channelId: interaction.channelId,
               hasVotingRole: hasVotingRole,
            }
         );

         if (!hasVotingRole)
            throw new Error(
               'This member has no voting roles. Their participation can not be gauged, because they are unable to participate.'
            );

         const eligibleChannels = await User.findEligibleChannels(memberRoles);

         const newUser = await User.createUser(
            guildId,
            voterId,
            eligibleChannels
         );
         Logger.debug(
            'commands/nerman/poll/participation.js: Created new user.',
            {
               userId: interaction.user.id,
               guildId: interaction.guildId,
               channelId: interaction.channelId,
            }
         );

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
         const { eligiblePolls: witnessed, participatedPolls: participated } =
            voterDoc.eligibleChannels.get(channelId);

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

      Logger.info(
         'commands/nerman/poll/participation.js: Finished retrieving poll participation.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         }
      );
   },
};
