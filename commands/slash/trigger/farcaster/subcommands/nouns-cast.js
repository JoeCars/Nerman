const { CommandInteraction } = require('discord.js');
const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_TEXT = "Who's on the Tal'Dorei Council?";

module.exports = {
   subCommand: 'trigger-farcaster.nouns-cast',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const text = interaction.options.getString('text') ?? DEFAULT_TEXT;

      const farcaster = interaction.client.libraries.get('Farcaster');
      farcaster.trigger('NounsCast', {
         text: text,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a Farcaster NounsCast event.',
      });

      Logger.info(
         'commands/trigger-farcaster.nouns-cast.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
