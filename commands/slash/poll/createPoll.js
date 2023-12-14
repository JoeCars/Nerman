const { CommandInteraction } = require('discord.js');

const Poll = require('../../../db/schemas/Poll');
const PollChannel = require('../../../db/schemas/PollChannel');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');
const { generatePollModal } = require('../../../views/modals');

module.exports = {
   subCommand: 'nerman.create-poll',
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/nerman/poll/createPoll.js: Starting to create polls.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );

      const {
         channelId,
         user: { id: userId },
      } = interaction;

      const configExists = await PollChannel.configExists(channelId);

      // Test existence of channel configuration
      if (!configExists) {
         return interaction.reply({
            content:
               'There are no configurations registered to this channel. You may only register from a channel in which polling has been configured.',
            ephemeral: true,
         });
      }

      // Actually retrieve configuration
      const channelConfig = await PollChannel.findOne(
         { channelId },
         'maxUserProposal voteAllowance forAgainst allowedRoles',
      ).exec();

      const countedPolls = await Poll.countDocuments({
         config: channelConfig._id,
         creatorId: userId,
         status: 'open',
      });

      const shouldAuthorize = await needsAuthorization(
         channelConfig,
         interaction,
      );
      if (shouldAuthorize) {
         await authorizeInteraction(interaction, 2);
      } else {
         Logger.debug(
            'commands/poll/createPoll.js: User authorized with voting role.',
            {
               userId: userId,
               channelId: channelId,
               guildId: interaction.guildId,
            },
         );
      }

      if (countedPolls >= channelConfig.maxUserProposal) {
         throw new Error(
            `You have exceeded the maximum number (${channelConfig.maxUserProposal}) of active proposals permitted in this channel.`,
         );
      }

      const modal = generatePollModal(channelConfig);

      await interaction.showModal(modal.toJSON());

      Logger.info(
         'commands/nerman/poll/createPoll.js: Finished creating poll.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );
   },
};

async function needsAuthorization(channelConfig, interaction) {
   for (const roleId of channelConfig.allowedRoles) {
      const guildUser = await interaction.guild.members.fetch(
         interaction.user.id,
      );
      const rolesCollection = guildUser.roles.valueOf();
      const role = rolesCollection.get(roleId);

      if (role) {
         return false;
      }
   }
   return true;
}
