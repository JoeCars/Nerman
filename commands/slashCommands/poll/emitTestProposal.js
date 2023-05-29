const { SlashCommandBuilder } = require('@discordjs/builders');
const testProposal = require('../../../dummyData/testGraphSample.json');
const PollChannel = require('../../../db/schemas/PollChannel');
const Logger = require('../../../helpers/logger');

const propChannelId =
   process.env.DEPLOY_STAGE === 'staging'
      ? process.env.TESTNERMAN_NOUNCIL_CHAN_ID
      : process.env.DEVNERMAN_NOUNCIL_CHAN_ID;

// const adminId = process.env.NERMAN_G_ADMIN_ID;
const authorizedIds = process.env.BAD_BITCHES.split(',');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('emit-test-proposal')
      .setDescription(
         'Mimic a new proposal event from the blockchain to test the output to the nouncil-voting channel.'
      ),

   async execute(interaction) {
      Logger.info(
         'commands/nerman/poll/emit-test-proposal.js: Starting to emit a test proposal',
         {
            userId: interaction.user.id,
         }
      );

      const {
         client,
         user: { id: userId },
         guild: {
            channels: { cache: channelCache },
         },
         member: {
            roles: { cache: roleCache },
         },
      } = interaction;

      await interaction.deferReply({ ephemeral: true });

      // disabled until we do the permissions thang etc
      // if (!roleCache.has(adminId)) return;
      if (!authorizedIds.includes(userId)) {
         throw new Error('You lack the permissions to use this commmand.');
      }

      const propChannel = await channelCache.get(propChannelId);

      // return interaction.editReply({
      //    content: 'Aborting early...',
      //    ephemeral: true,
      // });

      const channelConfig = await PollChannel.findOne(
         {
            channelId: propChannelId,
         },
         '_id allowedRoles quorum duration'
      ).exec();

      let message = await propChannel.send({
         content: 'Generating proposal poll...',
      });

      // client.emit('newProposal', interaction, testProposal);
      client.emit('newProposal', message, testProposal);

      interaction.editReply({
         content: `Dummy proposal emitted, check #${propChannel.name} to see if the poll has been generated.`,
         ephemeral: true,
      });

      Logger.info(
         'commands/nerman/poll/emit-test-proposal.js: Finished emitting a test proposal',
         {
            userId: interaction.user.id,
         }
      );
   },
};
