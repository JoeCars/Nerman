const { SlashCommandBuilder } = require('@discordjs/builders');
const nDiscord = require(`../helpers/discord.js`);

module.exports = {
   data: new SlashCommandBuilder()
      .setName('threshold')
      .setDescription('Displays # of reactions required to tweet message'),
   async execute(interaction) {
      const voteThreshold = await nDiscord.getThreshold();
      // let memberCount = interaction.member.guild.memberCount;
      // let voteThreshold = Math.floor(memberCount * 0.01);
      // let voteThreshold = 3;
      await interaction.reply(voteThreshold + " reactions required to tweet a message.");
   },
}; 