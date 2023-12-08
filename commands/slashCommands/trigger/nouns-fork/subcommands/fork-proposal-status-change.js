const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_PROPOSAL_NUMBER = 117;
const DEFAULT_STATUS = 'Executed';

module.exports = {
   subCommand: 'trigger-nouns-fork.fork-proposal-status-change',

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
         'commands/trigger-nouns-fork.fork-proposal-status-change.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
