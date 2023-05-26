const { MessageEmbed, ContextMenuInteraction } = require('discord.js');
const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { Modal, TextInputComponent, showModal } = require('discord-modals');
const { ApplicationCommandType } = require('discord-api-types/v9');

const Poll = require('../../db/schemas/Poll');

const { log: l } = console;

// fixme will need to remove these after we figure out a better permission control for admin command
const authorizedIds = process.env.BAD_BITCHES.split(',');

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
      try {
         // todo Maybe make sure that when participation is being calculated or regenerated for users, to check for poll.status === 'cancelled', as well as whether or not the users are simply included in the poll.allowedUsers Map?
         const {
            client,
            targetId,
            guildId,
            memberPermissions,
            user: {id: userId}
         } = interaction;

         l({ targetId, guildId });

         if (!authorizedIds.includes(userId)) {
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
            'status -_id'
         ).exec();

         l({ targetPoll });

         if (!targetPoll) {
            throw new Error(
               'There is no poll associated with this message ID.'
            );
         }

         if (['closed', 'cancelled'].includes(targetPoll.status)) {
            throw new Error('This poll is already closed or cancelled');
         }

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

         await showModal(confirmModal, {
            client: client,
            interaction: interaction,
         });
      } catch (error) {
         l({ error });

         throw new Error(error.message);
      }
   },
};
