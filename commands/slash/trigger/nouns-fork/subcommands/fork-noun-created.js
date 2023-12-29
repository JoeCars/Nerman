const { CommandInteraction } = require('discord.js');

const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_NOUN_ID = 117;

module.exports = {
   subCommand: 'trigger-nouns-fork.fork-noun-created',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const nounId =
         interaction.options.getNumber('noun-id') ?? DEFAULT_NOUN_ID;

      const Nouns = interaction.client.libraries.get('NounsFork');
      Nouns.trigger('NounCreated', {
         id: nounId,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a ForkNounCreated event.',
      });

      Logger.info(
         'commands/trigger-nouns-fork-tokens.fork-noun-created.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
