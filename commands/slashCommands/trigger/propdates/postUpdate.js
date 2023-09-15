const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../../helpers/logger');
const { authorizeInteraction } = require('../../../../helpers/authorization');

const DEFAULT_PROPOSAL_NUMBER = 117;
const DEFAULT_IS_COMPLETED = false;
const DEFAULT_UPDATE = '';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-post-update')
      .setDescription('Trigger a PostUpdate event.')
      .addNumberOption(option => {
         return option
            .setName('proposal-number')
            .setDescription('The proposal number.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addBooleanOption(option => {
         return option
            .setName('is-completed')
            .setDescription('The current status of the proposal.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addStringOption(option => {
         return option
            .setName('update')
            .setDescription('The update description.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      }),

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
         'commands/trigger/propdates/postUpdate.js: A PostUpdate event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
