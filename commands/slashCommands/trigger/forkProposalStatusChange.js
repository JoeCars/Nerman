const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_PROPOSAL_NUMBER = 117;
const DEFAULT_STATUS = 'Executed';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-fork-prop-status-change')
      .setDescription('Trigger a prop status change event.')
      .addNumberOption(option => {
         return option
            .setName('proposal-number')
            .setDescription('The proposal number.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addStringOption(option => {
         return option
            .setName('proposal-status')
            .setDescription('The proposal status.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development')
            .addChoices([
               ['Canceled', 'Canceled'],
               ['Queued', 'Queued'],
               ['Executed', 'Executed'],
            ]);
      }),

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const propNumber =
         interaction.options.getNumber('proposal-number') ??
         DEFAULT_PROPOSAL_NUMBER;
      const propStatus =
         interaction.options.getString('proposal-status') ?? DEFAULT_STATUS;

      const nouns = interaction.client.libraries.get('NounsFork');
      nouns.trigger(`Proposal${propStatus}`, {
         id: propNumber,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a ForkProposalStatusChange event.',
      });

      Logger.info(
         'commands/trigger/forkProposalStatusChange.js: A forkProposalStatusChange event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
