const { MessageEmbed, ContextMenuInteraction } = require('discord.js');
const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { Modal, TextInputComponent, showModal } = require('discord-modals');
const { ApplicationCommandType } = require('discord-api-types/v9');

const Poll = require('../../db/schemas/Poll');
const Logger = require('../../helpers/logger');
const { isUserAuthorized } = require('../../helpers/authorization');

module.exports = {
   data: new ContextMenuCommandBuilder()
      .setName('Cancel Poll')
      // .setDescription(
      //    'Testing this context command for the cancel Poll command.'
      // )
      .setType(ApplicationCommandType.Message),
   /**
    * @param {ContextMenuInteraction} interaction
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
         const {
            client,
            targetId,
            guildId,
            memberPermissions,
            user: { id: userId },
         } = interaction;

         const guildUser = await interaction.guild.members.fetch(userId);
         if (!(await isUserAuthorized(2, guildUser))) {
            throw new Error('You do not have permission to use this command.');
         }

         // disabled until we nail down the cross-guild permissions on this command
         // if (!memberPermissions.has('MANAGE_GUILD')) {
         //    throw new Error(
         //       'You require manage guild permissions to use this command'
         //    );
         // }

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

         const confirmModal = createConfirmationModal(targetId);

         await showModal(confirmModal, {
            client: client,
            interaction: interaction,
         });

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

function createConfirmationModal(targetId) {
   const confirmModal = new Modal()
      .setCustomId(`cancel-modal-${targetId}`)
      .setTitle('Cancel Poll?');

   const confirmCancel = new TextInputComponent()
      .setCustomId('confirmCancel')
      .setLabel(`Type 'confirm' (no quotes) then submit.`)
      .setPlaceholder('confirm')
      .setStyle('SHORT')
      .setMaxLength(100)
      .setRequired(true);

   confirmModal.addComponents(confirmCancel);
   return confirmModal;
}
