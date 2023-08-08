const { CommandInteraction } = require('discord.js');
const Logger = require('../../../helpers/logger');
const { isUserAuthorized } = require('../../../helpers/authorization');

const DEFAULT_PROPOSAL_NUMBER = 117;
const DEFAULT_STATUS = 'Executed';

module.exports = {
   subCommand: 'nerman-trigger.prop-status-change',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      const guildUser = await interaction.guild.members.fetch(
         interaction.user.id,
      );
      if (!(await isUserAuthorized(4, guildUser))) {
         throw new Error('This is an admin-only command');
      }

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
         'commands/trigger/propStatusChange.js: A prop status change event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
