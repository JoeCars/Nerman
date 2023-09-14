const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_NOUN_ID = 117;

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-fork-noun-created')
      .setDescription('Trigger a noun created event.')
      .addNumberOption(option => {
         return option
            .setName('noun-id')
            .setDescription('The noun created.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      }),

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const nounId =
         interaction.options.getNumber('noun-id') ?? DEFAULT_NOUN_ID;

      const Nouns = interaction.client.libraries.get('NounsFork');
      Nouns.emit('NounCreated', {
         id: nounId,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a ForkNounCreated event.',
      });

      Logger.info(
         'commands/trigger/forkNounCreated.js: A ForkNounCreated event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
