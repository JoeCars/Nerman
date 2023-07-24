const { CommandInteraction } = require('discord.js');
const Logger = require('../../../helpers/logger');
const { isUserAuthorized } = require('../../../helpers/authorization');

const DEFAULT_PROPOSAL_NUMBER = 117;
const DEFAULT_PROPOSAL_TITLE = 'Six Seasons And A Movie!';

module.exports = {
   subCommand: 'nerman.trigger.prop-created',

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

      const proposalNumber =
         interaction.options.getNumber('proposal-number') ??
         DEFAULT_PROPOSAL_NUMBER;
      const proposalTitle =
         interaction.options.getString('proposal-title') ??
         DEFAULT_PROPOSAL_TITLE;

      const Nouns = interaction.client.libraries.get('Nouns');
      Nouns.trigger('ProposalCreatedWithRequirements', {
         id: proposalNumber,
         description: `# ${proposalTitle}`,
         proposer: {},
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a PropCreated event.',
      });

      Logger.info(
         'commands/trigger/proCreated.js: A prop created event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
