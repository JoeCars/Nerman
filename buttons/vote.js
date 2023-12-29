const { ButtonInteraction } = require('discord.js');

const Poll = require('../db/schemas/Poll');
const PollChannel = require('../db/schemas/PollChannel');
const Logger = require('../helpers/logger');
const { checkUserEligibility } = require('../helpers/buttonEligibility');
const { generateVoteModal } = require('../views/modals');

module.exports = {
   id: 'vote',
   /**
    *
    * @param {ButtonInteraction} interaction
    */
   async execute(interaction) {
      Logger.info('buttons/vote.js: Attempting to press the vote button.', {
         userId: interaction.user.id,
         guildId: interaction.guildId,
         channelId: interaction.channelId,
         messageId: interaction.message.id,
      });

      if (!interaction.isButton()) {
         return;
      }

      const {
         channelId,
         message: { id: messageId },
         user: { id: userId },
         member: {
            joinedTimestamp,
            roles: { cache: roleCache },
         },
      } = interaction;

      const { allowedRoles } = await PollChannel.findOne(
         { channelId },
         'allowedRoles',
      ).exec();

      const attachedPoll = await Poll.findOne({ messageId })
         .populate([{ path: 'config' }])
         .exec();

      const eligibility = await checkUserEligibility(
         roleCache,
         allowedRoles,
         attachedPoll,
         userId,
         joinedTimestamp,
      );

      if (!eligibility.isEligible) {
         return interaction.reply({
            content: eligibility.message,
            ephemeral: true,
         });
      }

      const modal = generateVoteModal(attachedPoll);

      try {
         await interaction.showModal(modal.toJSON());
      } catch (error) {
         Logger.error('buttons/vote.js: Received an error.', {
            error: error,
         });
      }

      Logger.info('buttons/vote.js: Finished pressing the vote button.', {
         userId: interaction.user.id,
         guildId: interaction.guildId,
         channelId: interaction.channelId,
         messageId: interaction.message.id,
      });
   },
};
