const { CommandInteraction } = require('discord.js');
const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_PROPOSAL_NUMBER = 117;
const DEFAULT_STATUS = 'Executed';

module.exports = {
   subCommand: 'trigger-nouns-dao.prop-status-change',

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

      const Nouns = interaction.client.libraries.get('Nouns');
      Nouns.trigger(`Proposal${propStatus}`, {
         id: propNumber,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a prop status change event.',
      });

      Logger.info(
         'commands/trigger-nouns-dao.prop-status-change.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
