module.exports = {
   id: 'yes',
   execute(interaction) {
      interaction.reply({ content: 'Button YES pressed', ephemeral: true });
   },
};
