module.exports = {
   id: 'abstain',
   execute(interaction) {
      interaction.reply({ content: 'Button ABSTAIN pressed', ephemeral: true });
   },
};
