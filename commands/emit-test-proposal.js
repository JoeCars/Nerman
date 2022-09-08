const { SlashCommandBuilder } = require('@discordjs/builders');
const testProposal = require('../scratchcode/testGraphSample.json');
const { log: l, time: t, timeEnd: te } = console;

module.exports = {
   data: new SlashCommandBuilder()
      .setName('emit-test-proposal')
      .setDescription("Mimic Joel's event emitter for a new proposal and using some old data from a prior Nouns prop."),

   async execute(interaction) {
      const {
         client,
         member: {
            roles: { cache: roleCache },
         },
      } = interaction;

      await interaction.deferReply({ ephemeral: true });

      if (!roleCache.has('919784986641575946')) return;

      client.emit('newProposal', interaction, testProposal);
   },
};
