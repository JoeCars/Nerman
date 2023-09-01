const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_PROPOSER_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_PROPOSAL_TITLE = 'Blood For The Blood God';
const DEFAULT_PROPOSAL_REASON =
   'Turns out the Blood God was planning on destroying the planet, so we will not be feeding it after all.';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-candidate-canceled')
      .setDescription('Trigger a proposal candidate canceled event.')
      .addStringOption(option => {
         return option
            .setName('proposer-address')
            .setDescription("The proposer's wallet address.")
            .setRequired(false);
      })
      .addNumberOption(option => {
         return option
            .setName('proposal-title')
            .setDescription("The proposal's title.")
            .setRequired(false);
      })
      .addStringOption(option => {
         return option
            .setName('reason')
            .setDescription('The reason for cancelling.')
            .setRequired(false);
      }),

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const proposerAddress =
         interaction.options.getString('proposer-address') ??
         DEFAULT_PROPOSER_ADDRESS;
      const proposalTitle =
         interaction.options.getString('proposal-title') ??
         DEFAULT_PROPOSAL_TITLE;
      const proposalReason =
         interaction.options.getString('reason') ?? DEFAULT_PROPOSAL_REASON;

      const Nouns = interaction.client.libraries.get('Nouns');
      Nouns.trigger('ProposalCandidateCanceled', {
         msgSender: { id: proposerAddress },
         slug: proposalTitle
            .split(' ')
            .map(word => {
               return word.toLowerCase().trim();
            })
            .join('-'),
         reason: proposalReason,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a ProposalCandidateCanceled event.',
      });

      Logger.info(
         'commands/trigger/proposalCandidateCanceled.js: A ProposalCandidateCanceled event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
