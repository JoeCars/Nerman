const { Modal, TextInputComponent, showModal } = require('discord-modals');
const { ButtonInteraction, Client } = require('discord.js');

module.exports = {
   id: 'vote',
   /**
    *
    * @param {ButtonInteraction} interaction
    */
   execute(interaction) {
      console.log({ interaction });

      const modal = new Modal().setCustomId('vote-modal');

      console.log({ modal });
   },
};
