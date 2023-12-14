const { CommandInteraction } = require('discord.js');

const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_FORK_ID = 0;
const DEFAULT_TOKEN_NUMBER = 69;
const DEFAULT_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';

module.exports = {
   subCommand: 'trigger-nouns-dao.execute-fork',

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
         'commands/trigger-nouns-dao.execute-fork.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
