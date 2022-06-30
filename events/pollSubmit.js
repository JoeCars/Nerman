const { Modal } = require('discord-modals');
const { MessageEmbed, MessageButton } = require('discord.js');

module.exports = {
   name: 'modalSubmit',
   /**
    * @param Modal modal
    */
   async execute(modal) {
      console.log('pollSubmit PRE');
      console.log(modal.customId);
      if (modal.customId !== 'modal-create-poll') return;
      console.log('pollSubmit POST');
      console.log({ modal });

      await modal.deferReply({ ephemeral: true });

      console.log({ modal });
      // extract data from submitted modal
      const type = modal.getSelectMenuValues('pollType');
      const title = modal.getTextInputValue('pollTitle');
      const description = modal.getTextInputValue('pollDescription');
      const options = modal.getTextInputValue('pollChoices').trim().split(',');

      let rows = [];
      let buttonAmount = options.length;

      console.log({ type, description, title, options });

      // if (Math.sign(buttonAmount) !== 1 || buttonAmount > 25) {
      //    return modal.followUp({
      //       embeds: [
      //          new MessageEmbed()
      //             .setColor('RED')
      //             .setDescription('There must be between 2 and 25 buttons.'),
      //       ],
      //    });
      // }

      const rowCount = Math.ceil(buttonAmount / 5);

      // for (let i = 0; i < rowCount; i++) {
      //    const row = new MessageActionRow();
      //    for (j = 0; j < buttonAmount && j < 5; j++) {
      //       const label = `Option ${i * 5 + j + 1} `;
      //       const customId = `row-${i + 1}-button-${j + 1}`;

      //       row.addComponents(
      //          new MessageButton()
      //             .setCustomId(customId)
      //             .setLabel(label)
      //             .setStyle('PRIMARY')
      //       );

      //    }

      //    buttonAmount -= 5;
      //    rows.push(row);
      // }

      const yesBtn = new MessageButton()
         .setCustomId('yes')
         .setLabel('Yes')
         .setStyle('PRIMARY');
      const noBtn = new MessageButton()
         .setCustomId('no')
         .setLabel('No')
         .setStyle('PRIMARY');
      const abstainBtn = new MessageButton()
         .setCustomId('abstain')
         .setLabel('Abstain')
         .setStyle('PRIMARY');

      rows.push(yesBtn);
      rows.push(noBtn);
      rows.push(abstainBtn);

      modal.reply({
         content: 'This is a test poll',
         components: rows,
         ephemeral: true,
         fetchReply: true,
      });
   },
};
