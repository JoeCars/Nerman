const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_DELEGATOR_ID = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_NEW_DELEGATE_ID = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_NOUNS_TRANSFERRED = 42;

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-fork-delegate-changed')
      .setDescription('Trigger a delegate changed event.')
      .addStringOption(option => {
         return option
            .setName('delegator-id')
            .setDescription("The delegator's wallet address.")
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addStringOption(option => {
         return option
            .setName('new-delegate-id')
            .setDescription("The new delegate's wallet address.")
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addNumberOption(option => {
         return option
            .setName('nouns-transferred')
            .setDescription('The number of nouns being transferred.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      }),

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const delegatorId =
         interaction.options.getString('delegator-id') ?? DEFAULT_DELEGATOR_ID;
      const newDelegateId =
         interaction.options.getString('new-delegate-id') ??
         DEFAULT_NEW_DELEGATE_ID;
      const nounsTransferred =
         interaction.options.getNumber('nouns-transferred') ??
         DEFAULT_NOUNS_TRANSFERRED;
      let nounsTransferredHex = nounsTransferred.toString(16);
      nounsTransferredHex = `0x${'0'.repeat(
         128 - nounsTransferredHex.length,
      )}${nounsTransferredHex}`;

      const Nouns = interaction.client.libraries.get('NounsForkToken');
      Nouns.trigger('DelegateChanged', {
         delegator: {
            id: delegatorId,
         },
         toDelegate: {
            id: newDelegateId,
         },
         fromDelegate: {
            id: DEFAULT_DELEGATOR_ID,
         },
         event: {
            getTransactionReceipt() {
               return {
                  logs: [
                     {},
                     {
                        data: nounsTransferredHex,
                     },
                  ],
               };
            },
         },
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a ForkDelegateChanged event.',
      });

      Logger.info(
         'commands/trigger/forkDelegateChanged.js: A forkDelegateChanged event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
