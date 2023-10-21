const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_OWNER_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_TOKEN_NUMBER = 2;

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-fork-quit')
      .setDescription('Trigger a fork quit event.')
      .addStringOption(option => {
         return option
            .setName('owner-address')
            .setDescription("The owner's address.")
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
         'commands/trigger/forkQuit.js: A ForkQuit event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
