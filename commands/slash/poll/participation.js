const { CommandInteraction, codeBlock } = require('discord.js');

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
         'commands/slashCommands/poll/participation.js: Starting to retrieve poll participation.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
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
            'There are no configurations registered to this channel. You may only register from a channel in which polling has been configured.',
         );
      }

      // 993371424662224986 nerman-dev-jr
      const voterId =
         interaction.options.getUser('discord-user')?.id ??
         interaction.member.user.id;

      const response = await createParticipationStats(
         mCache,
         voterId,
         members,
         guildId,
         channelName,
         channelId,
      );

      return interaction.reply({
         content: response,
         ephemeral: true,
      });

      Logger.info(
         'commands/slashCommands/poll/participation.js: Finished retrieving poll participation.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );
   },
};

async function createParticipationStats(
   mCache,
   voterId,
   members,
   guildId,
   channelName,
   channelId,
) {
   const {
      nickname,
      user: { username, discriminator },
      roles: { cache: memberRoles },
   } = mCache.get(voterId) ?? (await members.fetch(voterId));

   let voterDoc = await User.findOne().byDiscordId(voterId, guildId).exec();

   if (!voterDoc) {
      voterDoc = await createNewUser(memberRoles, voterDoc, guildId, voterId);
   }

   const header = createHeader(channelName, discriminator, username, nickname);

   const { eligiblePolls: witnessed, participatedPolls: participated } =
      voterDoc.eligibleChannels.get(channelId);

   const participation = await voterDoc.participation(channelId);

   const stats = createStats(witnessed, participated, participation);

   return `${header}${stats}`;
}

async function createNewUser(memberRoles, voterDoc, guildId, voterId) {
   const hasVotingRole = await User.checkVotingRoles(memberRoles);

   if (!hasVotingRole) {
      throw new Error(
         'This member has no voting roles. Their participation can not be gauged, because they are unable to participate.',
      );
   }

   const eligibleChannels = await User.findEligibleChannels(memberRoles);

   return await User.createUser(guildId, voterId, eligibleChannels);
}

function createHeader(
   channelName,
   discriminator,
   username,
   nickname = undefined,
) {
   return `**#${channelName} | ${
      nickname ?? username
   }#${discriminator} vote participation**\n`;
}

function createStats(witnessed, participated, participation) {
   return codeBlock(
      `${witnessed} votes witnessed\n${participated} votes participated\n${participation} participation rate`,
   );
}
