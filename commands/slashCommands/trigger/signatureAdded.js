const { CommandInteraction } = require('discord.js');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_PROPOSAL_TITLE = 'Experience';
const DEFAULT_PROPOSAL_REASON = 'In my book, experience outranks everything.';
const DEFAULT_PROPOSER_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_SIGNER_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';

module.exports = {
   subCommand: 'nerman-trigger.signature-added',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const proposerWallet =
         interaction.options.getString('proposer-address') ??
         DEFAULT_PROPOSER_ADDRESS;
      const signerWallet =
         interaction.options.getString('signer-address') ??
         DEFAULT_SIGNER_ADDRESS;
      const proposalTitle =
         interaction.options.getString('proposal-title') ??
         DEFAULT_PROPOSAL_TITLE;
      const proposalReason =
         interaction.options.getString('reason') ?? DEFAULT_PROPOSAL_REASON;

      const Nouns = interaction.client.libraries.get('Nouns');
      Nouns.trigger('SignatureAdded', {
         slug: proposalTitle
            .split(' ')
            .map(word => {
               return word.toLowerCase().trim();
            })
            .join('-'),
         proposer: { id: proposerWallet },
         signer: { id: signerWallet },
         reason: proposalReason,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a SignatureAdded event.',
      });

      Logger.info(
         'commands/trigger/signatureAdded.js: A signature added event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
