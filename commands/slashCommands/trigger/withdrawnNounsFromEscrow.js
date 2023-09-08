const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_TOKEN_NUMBER = 69;
const DEFAULT_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-withdraw-from-escrow')
      .setDescription('Trigger a withdrawNounsFromEscrow event.')
      .addStringOption(option => {
         return option
            .setName('withdrawer-address')
            .setDescription('The withdrawer address.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addNumberOption(option => {
         return option
            .setName('token-number')
            .setDescription('The number of tokens being escrowed.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      }),

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const withdrawerAddress =
         interaction.options.getString('withdrawer-address') ?? DEFAULT_ADDRESS;
      const tokenNumber =
         interaction.options.getNumber('token-number') ?? DEFAULT_TOKEN_NUMBER;

      const Nouns = interaction.client.libraries.get('Nouns');
      Nouns.trigger('DAOWithdrawNounsFromEscrow', {
         to: { id: withdrawerAddress },
         tokenIds: new Array(tokenNumber),
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a WithdrawNounsFromEscrow event.',
      });

      Logger.info(
         'commands/trigger/withdrawNounsFromEscrow.js: A WithdrawNounsFromEscrow event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
