const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_OWNER_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_TOKEN_NUMBER = 2;

module.exports = {
   subCommand: 'trigger-nouns-fork.fork-quit',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const quitter =
         interaction.options.getString('owner-address') ??
         DEFAULT_OWNER_ADDRESS;
      const tokenNumber =
         interaction.options.getNumber('token-number') ?? DEFAULT_TOKEN_NUMBER;

      const nouns = interaction.client.libraries.get('NounsFork');
      nouns.trigger('Quit', {
         msgSender: { id: quitter },
         tokenIds: new Array(tokenNumber),
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a ForkQuit event.',
      });

      Logger.info(
         'commands/trigger-nouns-fork.fork-quit.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
