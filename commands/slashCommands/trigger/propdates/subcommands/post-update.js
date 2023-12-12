const { CommandInteraction } = require('discord.js');

const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_PROPOSAL_NUMBER = 117;
const DEFAULT_IS_COMPLETED = false;
const DEFAULT_UPDATE = '';

module.exports = {
   subCommand: 'trigger-propdates.post-update',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const proposalNumber =
         interaction.options.getNumber('proposal-number') ??
         DEFAULT_PROPOSAL_NUMBER;
      const isCompleted =
         interaction.options.getBoolean('is-completed') ?? DEFAULT_IS_COMPLETED;
      const update = interaction.options.getString('update') ?? DEFAULT_UPDATE;

      console.log({
         propId: proposalNumber,
         isCompleted: isCompleted,
         update: update,
      });

      const propdates = interaction.client.libraries.get('Propdates');
      propdates.trigger('PostUpdate', {
         propId: proposalNumber,
         isCompleted: isCompleted,
         update: update,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a PostUpdate event.',
      });

      Logger.info(
         'commands/trigger-propdates.post-update.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
