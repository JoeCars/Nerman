const { SlashCommandBuilder } = require('@discordjs/builders');
const { Message, MessageAttachment, MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('noun')
      .setDescription('Get the SVG of specified Noun:  /noun 3')
      .addIntegerOption(option =>
         option.setName('int').setDescription('Enter an integer')
      ),
   async execute(interaction) {
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
         content: `Noun ${nounNum}`,
         files: [msgAttach],
         ephemeral: true,
      });
   },
};
