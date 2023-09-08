const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_FORK_ID = 0;
const DEFAULT_OWNER_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_TOKEN_NUMBER = 2;
const DEFAULT_REASON = '';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-escrow-to-fork')
      .setDescription('Trigger an escrow to fork event.')
      .addNumberOption(option => {
         return option
            .setName('fork-id')
            .setDescription('The fork id.')
            .setRequired(false);
      })
      .addStringOption(option => {
         return option
            .setName('owner-address')
            .setDescription("The owner's address.")
            .setRequired(false);
      })
      .addNumberOption(option => {
         return option
            .setName('token-number')
            .setDescription('The number of tokens being escrowed.')
            .setRequired(false);
      })
      .addStringOption(option => {
         return option
            .setName('reason')
            .setDescription('The reason for the fork.')
            .setRequired(false);
      }),

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const forkId =
         interaction.options.getNumber('fork-id') ?? DEFAULT_FORK_ID;
      const ownerAddress =
         interaction.options.getString('owner-address') ??
         DEFAULT_OWNER_ADDRESS;
      const tokenNumber =
         interaction.options.getNumber('token-number') ?? DEFAULT_TOKEN_NUMBER;
      const reason = interaction.options.getString('reason') ?? DEFAULT_REASON;

      const Nouns = interaction.client.libraries.get('Nouns');
      Nouns.trigger('EscrowedToFork', {
         forkId: forkId,
         owner: { id: ownerAddress },
         tokenIds: new Array(tokenNumber),
         reason: reason,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a EscrowedToFork event.',
      });

      Logger.info(
         'commands/trigger/escrowedToFork.js: A EscrowedToFork event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
