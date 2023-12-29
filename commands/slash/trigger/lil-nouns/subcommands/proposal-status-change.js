const { CommandInteraction } = require('discord.js');
const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_PROPOSAL_NUMBER = 117;
const DEFAULT_STATUS = 'Executed';

module.exports = {
   subCommand: 'trigger-lil-nouns.proposal-status-change',

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

      const lilNouns = interaction.client.libraries.get('LilNouns');
      lilNouns.trigger(`Proposal${propStatus}`, {
         id: propNumber,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a LilNounsProposalStatusChange event.',
      });

      Logger.info(
         'commands/trigger-lil-nouns.proposal-status-change.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
