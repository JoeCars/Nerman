const { SlashCommandBuilder } = require('@discordjs/builders');
const { Message, MessageAttachment, MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('noun')
      .setDescription('Get the PNG of specified Noun:  /noun 3')
      .addIntegerOption(option =>
         option.setName('int').setDescription('Enter noun id')
      ),
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
