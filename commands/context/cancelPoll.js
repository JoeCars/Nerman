const {
   MessageContextMenuCommandInteraction,
   ContextMenuCommandBuilder,
   ApplicationCommandType,
} = require('discord.js');

const Poll = require('../../db/schemas/Poll');
const Logger = require('../../helpers/logger');
const { authorizeInteraction } = require('../../helpers/authorization');
const { generateCancelConfirmationModal } = require('../../views/modals');

module.exports = {
   data: new ContextMenuCommandBuilder()
      .setName('Cancel Poll')
      .setType(ApplicationCommandType.Message),
   /**
    * @param {MessageContextMenuCommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/context/cancelPoll.js: Attempting to cancel the poll.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            targetMessageId: interaction.targetId,
         },
      );

      try {
         // todo Maybe make sure that when participation is being calculated or regenerated for users, to check for poll.status === 'cancelled', as well as whether or not the users are simply included in the poll.allowedUsers Map?
         const { targetId, guildId } = interaction;

         await authorizeInteraction(interaction, 2);

         const targetPoll = await Poll.findOne(
            {
               messageId: targetId,
               guildId: guildId,
            },
            'status -_id',
         ).exec();

         const pollValidity = checkPollValidity(targetPoll);

         if (!pollValidity.isValid) {
            throw new Error(pollValidity.message);
         }

         const confirmModal = generateCancelConfirmationModal(targetId);

         await interaction.showModal(confirmModal.toJSON());

         Logger.info(
            'commands/context/cancelPoll.js: Successfully cancelled the poll.',
            {
               userId: interaction.user.id,
               guildId: interaction.guildId,
               targetMessageId: interaction.targetId,
               pollId: targetPoll._id,
            },
         );
      } catch (error) {
         Logger.error('commands/context/cancelPoll.js: Received an error.', {
            error: error,
         });

         throw new Error(error.message);
      }
   },
};

function checkPollValidity(targetPoll) {
   if (!targetPoll) {
      return {
         isValid: false,
         message: 'There is no poll associated with this message ID.',
      };
   }

   if (['closed', 'cancelled'].includes(targetPoll.status)) {
      return {
         isValid: false,
         message: 'This poll is already closed or cancelled',
      };
   }

   return {
      isValid: true,
      message: 'This poll is valid.',
   };
}
