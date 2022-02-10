const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const nounpic = require(`../helpers/nounpic.js`);

module.exports = {
   data: new SlashCommandBuilder()
      .setName('nouner')
      .setDescription(
         'Retrieve a tile of Nouns owned by a nouner.  Command Structure: /nouner <ETH Address || ENS Name>'
      )
      .addStringOption(option =>
         option
            .setName('target')
            .setDescription('Enter a ENS name or wallet address')
            .setRequired(true)
      )
      .addBooleanOption(option =>
         option
            .setName('delegates')
            .setDescription(
               'Include Nouns delegated to this address? (This is false if left blank)'
            )
      ),

   async execute(interaction) {
      const queryTarget = interaction.options.getString('target');
      const includeDelegates =
         interaction.options.getBoolean('delegates') ?? false;

      interaction.deferReply();

      const resp = await fetch(
         `https://noun.pics/${queryTarget}?includeDelegates=${includeDelegates}`
      );

      if (!resp.ok) {
         throw new Error(
            `Unable to return any tile connected to ${queryTarget}, are you sure this nouner exists?`
         );
      }

      const msgAttach = await nounpic.fetchNouner(
         queryTarget,
         includeDelegates
      );

      await interaction.editReply({
         content: `Retrieving tile of nouns belonging to ${queryTarget}`,
         files: [msgAttach],
         ephemeral: false,
      });
   },
};
