const { SlashCommandBuilder } = require('@discordjs/builders');
const { Message, MessageAttachment, MessageEmbed } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('noun')
      .setDescription('Get the SVG of specified Noun. EG.  /noun 3')
      .addIntegerOption(option => option.setName('int').setDescription('Enter an integer')),
      //.addIntegerOption(option => option.setName('int').setDescription('Enter an integer')),
   async execute(interaction) {

      const nounNum = interaction.options.getInteger('int');

         const msgAttach = new MessageAttachment('https://noun.pics/'+nounNum+'.png');
         await interaction.reply({'content':"Noun "+nounNum, 'files':[msgAttach]});
      
   },
};