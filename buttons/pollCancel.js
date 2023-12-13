const { ModalSubmitInteraction, EmbedBuilder } = require('discord.js');

const Poll = require('../db/schemas/Poll');
const Logger = require('../helpers/logger');

module.exports = {
   id: 'cancel-modal',
   /**
    *
    * @param {ModalSubmitInteraction} modal
    */
   async execute(modal) {
      Logger.info('events/poll/pollCancel.js: Attempting to cancel poll.', {
         guildId: modal.guild.id,
      });

      const rCustomId = new RegExp(/^cancel-modal-\d{19}$/);

      if (!rCustomId.test(modal.customId)) return;

      try {
         await modal.deferReply({ ephemeral: true });

         const {
            client,
            guild: { id: guildId },
            channel: { messages },
         } = modal;

         const confirm =
            modal.fields.getTextInputValue('confirmCancel').toLowerCase() ===
            'confirm';

         Logger.debug('events/poll/pollCancel.js: Checking confirmation.', {
            guildId: modal.guild.id,
            confirm: confirm,
         });

         if (!confirm) {
            throw new Error(
               'Please ensure you have correctly typed ***confirm*** if you wish to cancel this poll.',
            );
         }

         const messageId = modal.customId.substring(modal.customId.length - 19);

         Logger.debug('events/poll/pollCanel.js: Checking message id.', {
            guildId: modal.guild.id,
            messageId: messageId,
         });

         const targetMessage = await messages.fetch(messageId);
         const targetPoll = await Poll.findOne({
            messageId: messageId,
            guildId: guildId,
         }).exec();

         client.emit('dequeuePoll', targetPoll);

         targetPoll.clearProperty('allowedUsers');
         targetPoll.clearProperty('abstains');
         targetPoll.markModified('allowedUsers');
         targetPoll.markModified('abstains');
         targetPoll.status = 'cancelled';

         await targetPoll.save();

         const cancelFields = [
            {
               name: 'CANCELLED',
               value: '\u200B',
               inline: false,
            },
         ];

         const cancelEmbed = new EmbedBuilder(
            targetMessage.embeds[0],
         ).spliceFields(1, 4, cancelFields);

         await targetMessage.edit({
            content: null,
            embeds: [cancelEmbed],
            components: [],
         });

         modal.editReply({
            content: 'Poll has been cancelled!',
            ephemeral: true,
         });

         Logger.info('events/poll/pollCanel.js: Finished cancelling poll.', {
            guildId: modal.guild.id,
         });
      } catch (error) {
         modal.editReply({ content: error.message });
         throw new Error(error.message);
      }
   },
};
