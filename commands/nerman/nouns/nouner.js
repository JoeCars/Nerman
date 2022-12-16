const { CommandInteraction } = require('discord.js');
const fetch = require('node-fetch');
const nounpic = require(`../../../helpers/nounpic.js`);
const getNounerInfo = require('../../../helpers/nouns/getNounerInfo');
const createNounerEmbed = require('../../../helpers/nouns/createNounerEmbed');
const { log: l, error: lerr } = console;

module.exports = {
   subCommand: 'nerman.nouner',
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      const Nouns = interaction.client.libraries.get('Nouns');
      await interaction.deferReply({ ephemeral: true });

      // fixme I can take out these regexp now that the SON library handles that for me -- UPDATED:: Maybe I'll keep them in for now, because even though the library's regexp works. It only returns Null, which may not be sufficient for giving the user adequate feedback on why the command threw an error.
      const walletRegex = /^0x[a-fA-F0-9]{40}$/;
      const ensRegex = /^.*\.eth$/;

      const queryTarget = interaction.options.getString('target');

      // disabled until we can find a solution for outputting the tile in the embed
      const includeDelegates =
         interaction.options.getBoolean('delegates') ?? false;

      if (!walletRegex.test(queryTarget) && !ensRegex.test(queryTarget)) {
         throw new Error(
            `${queryTarget} is not a valid ENS name or wallet address format.\nWallet format: 0x<40 alphanumeric characters>\nENS example: <ensname>.eth`
         );
      }

      const nounerInfo = await getNounerInfo(Nouns, queryTarget);
      l('NOUNER INFO\n', nounerInfo);

      // disabled we're not currently using this image url for an attachment of this tile until we find a better solution vvvvv
      // const resp = await fetch(
      //    `https://noun.pics/${queryTarget}?includeDelegates=${includeDelegates}`
      // );

      // const attachUrl = `https://noun.pics/${queryTarget}?includeDelegates=${includeDelegates}`;

      // if (!resp.ok) {
      //    throw new Error(
      //       `Unable to return any tile connected to ${queryTarget}, are you sure this nouner exists?`
      //    );
      // }

      // const msgAttach = await nounpic.fetchNouner(
      //    queryTarget,
      //    includeDelegates
      // );

      // disabled we're not currently using this image url for an attachment of this tile until we find a better solution ^^^^^^^


      const nounerEmbed = await createNounerEmbed(nounerInfo);

      await interaction.editReply({
         // content: `Retrieving tile of nouns belonging to ${queryTarget}`,
         embeds: [nounerEmbed],
         // ephemeral: true,
      });
   },
};
