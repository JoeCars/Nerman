const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_NOUN_NUMBER = 117;
const DEFAULT_OLD_OWNER_ID = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_NEW_OWNER_ID = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-transfer-fork-noun')
      .setDescription('Trigger a transfer noun event.')
      .addNumberOption(option => {
         return option
            .setName('noun-number')
            .setDescription('The noun number.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addStringOption(option => {
         return option
            .setName('from-wallet')
            .setDescription('The wallet of the old owner.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addStringOption(option => {
         return option
            .setName('to-wallet')
            .setDescription('The wallet of the new owner.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      }),

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const oldId =
         interaction.options.getString('from-wallet') ?? DEFAULT_OLD_OWNER_ID;
      const newId =
         interaction.options.getString('to-wallet') ?? DEFAULT_NEW_OWNER_ID;
      const transferNoun =
         interaction.options.getNumber('noun-number') ?? DEFAULT_NOUN_NUMBER;

      const Nouns = interaction.client.libraries.get('NounsFork');
      Nouns.emit('Transfer', {
         tokenId: transferNoun,
         from: { id: oldId },
         to: { id: newId },
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a transferForkNoun event.',
      });

      Logger.info(
         'commands/trigger/transferNoun.js: A transferForkNoun event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
