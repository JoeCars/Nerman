const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_FORK_ID = 0;
const DEFAULT_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_TOKEN_NUMBER = 117;
const DEFAULT_REASON = '';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-join-fork')
      .setDescription('Trigger a joinFork event.')
      .addNumberOption(option => {
         return option
            .setName('fork-id')
            .setDescription('The fork id.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addStringOption(option => {
         return option
            .setName('owner-address')
            .setDescription('The owner address.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addNumberOption(option => {
         return option
            .setName('token-number')
            .setDescription('The number of tokens joining.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addStringOption(option => {
         return option
            .setName('reason')
            .setDescription('The reason.')
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
         interaction.options.getString('owner-address') ?? DEFAULT_ADDRESS;
      const tokenNumber =
         interaction.options.getNumber('token-number') ?? DEFAULT_TOKEN_NUMBER;
      const reason = interaction.options.getString('reason') ?? DEFAULT_REASON;

      const Nouns = interaction.client.libraries.get('Nouns');
      Nouns.trigger('JoinFork', {
         forkId: forkId,
         owner: { id: ownerAddress },
         tokenIds: new Array(tokenNumber),
         proposalIds: [],
         reason: reason,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a JoinFork event.',
      });

      Logger.info(
         'commands/trigger/joinFork.js: A JoinFork event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
