const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_FORK_ID = 0;
const DEFAULT_TOKEN_NUMBER = 69;
const DEFAULT_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-execute-fork')
      .setDescription('Trigger an execute fork event.')
      .addNumberOption(option => {
         return option
            .setName('fork-id')
            .setDescription('The fork id.')
            .setRequired(false);
      })
      .addNumberOption(option => {
         return option
            .setName('token-number')
            .setDescription('The number of tokens being escrowed.')
            .setRequired(false);
      }),

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const forkId =
         interaction.options.getNumber('fork-id') ?? DEFAULT_FORK_ID;
      const tokenNumber =
         interaction.options.getNumber('token-number') ?? DEFAULT_TOKEN_NUMBER;

      const Nouns = interaction.client.libraries.get('Nouns');
      Nouns.trigger('ExecuteFork', {
         forkId: forkId,
         forkTreasury: { id: DEFAULT_ADDRESS },
         forkToken: { id: DEFAULT_ADDRESS },
         tokensInEscrow: tokenNumber,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a ExecuteFork event.',
      });

      Logger.info(
         'commands/trigger/executeFork.js: A ExecuteFork event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
