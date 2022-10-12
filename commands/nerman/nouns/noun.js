const { MessageAttachment, CommandInteraction } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
   subCommand: 'nerman.noun',
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      // const nounRegex = /^\d{1,6}$/; // 1 to 6 digits. This may need to go higher as new ones are created daily.
      const nounNum = interaction.options.getInteger('int');

      //Opensea Link, Owner, previous auction info. Integrate Open Sea API

      const resp = await fetch(`https://noun.pics/${nounNum}.png`);

      if (!resp.ok) {
         throw new Error(
            `Unable to return Noun #${nounNum}, are you sure this Noun exists yet?`
         );
      }

      const msgAttach = new MessageAttachment(
         `https://noun.pics/${nounNum}.png`
      );

      await interaction.reply({
         // await interaction.editReply({
         content: `Noun ${nounNum}`,
         files: [msgAttach],
         ephermeral: true,
      });
   },
};
