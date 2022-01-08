const { SlashCommandBuilder } = require('@discordjs/builders');
const { Message, MessageAttachment, MessageEmbed } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('noun')
      .setDescription('Get the SVG of specified Noun. EG.  /noun 3')
      .addIntegerOption(option => option.setName('int').setDescription('Enter an integer')),
   async execute(interaction) {

      const nounNum = interaction.options.getInteger('int');

      if(false && (nounNum < 0 || nounNum > 9)) {

         await interaction.reply("Invalid Noun ID, only Nouns 0-9 supported currently");

      } else {


         const msgAttach = new MessageAttachment('https://noun.pics/'+nounNum+'.png');
         //const msgAttach = new MessageAttachment('./media/nouns/png/noun-'+nounNum+'.png');
         await interaction.reply({'content':"Noun "+nounNum, 'files':[msgAttach]});

         
      }
      
   },
};