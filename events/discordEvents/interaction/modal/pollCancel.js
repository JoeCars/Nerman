const { Modal } = require('discord-modals');

const {
   ButtonInteraction,
   ModalSubmitInteraction,
   MessageEmbed,
} = require('discord.js');

const Poll = require('../../../../db/schemas/Poll');

const { log: l } = console;

module.exports = {
   name: 'modalSubmit',
   /**
    *
    * @param {ModalSubmitInteraction} modal
    */
   async execute(modal) {
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
            modal.getTextInputValue('confirmCancel').toLowerCase() ===
            'confirm';

         l('CONFIRMED:', confirm);

         if (!confirm) {
            throw new Error(
               'Please ensure you have correctly typed ***confirm*** if you wish to cancel this poll.'
            );
         }

         const messageId = modal.customId.substring(modal.customId.length - 19);

         l({ messageId });
         l({ guildId });

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

         const cancelEmbed = new MessageEmbed(
            targetMessage.embeds[0]
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
      } catch (error) {
         modal.editReply({ content: error.message });
         throw new Error(error.message);
      }
   },
};
