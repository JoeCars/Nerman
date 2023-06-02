const { SlashCommandBuilder } = require('@discordjs/builders');
const testProposal = require('../../../dummyData/testGraphSample.json');
const PollChannel = require('../../../db/schemas/PollChannel');
const Logger = require('../../../helpers/logger');

const propChannelId =
   process.env.DEPLOY_STAGE === 'development'
      ? process.env.DEVNERMAN_NOUNCIL_CHAN_ID
      : process.env.TESTNERMAN_NOUNCIL_CHAN_ID;

const nounsGovId = process.env.NOUNS_GOV_ID;

// const adminId = process.env.NERMAN_G_ADMIN_ID;
const authorizedIds = process.env.BAD_BITCHES.split(',');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('emit-test-proposal')
      .setDescription(
         'Mimic a new proposal event from the blockchain to test the output to the nouncil-voting channel.',
      ),

   async execute(interaction) {
      Logger.info(
         'commands/nerman/poll/emit-test-proposal.js: Starting to emit a test proposal',
         {
            userId: interaction.user.id,
         },
      );

      const {
         client,
         client: {
            guilds: { cache: guildCache },
         },
         user: { id: userId },
         guild: {
            id: guildId,
            channels: { cache: channelCache },
         },
         member: {
            roles: { cache: roleCache },
         },
      } = interaction;

      if (!authorizedIds.includes(userId)) {
         throw new Error('You lack the permissions to use this commmand.');
      }

      await interaction.deferReply({ ephemeral: true });

      const propChannel = channelCache.get(propChannelId);

      const nounsGovChannel = channelCache.get(nounsGovId);

      // // AGORA + NCD TESTS
      // const ncdChannelId = process.env.NCD_CHANNEL_ID;
      // const agoraChannelId = process.env.AGORA_CHANNEL_ID;

      // const ncdChannel = guildCache
      //    .get(guildId)
      //    .channels.cache.get(ncdChannelId);

      // const agoraChannel = guildCache
      //    .get(guildId)
      //    .channels.cache.get(agoraChannelId);

      // disabled until we do the permissions thang etc
      // if (!roleCache.has(adminId)) return;

      // return interaction.editReply({
      //    content: 'Aborting early...',
      //    ephemeral: true,
      // });

      const channelConfig = await PollChannel.findOne(
         {
            channelId: propChannelId,
         },
         '_id allowedRoles quorum duration',
      ).exec();

      let message = await propChannel.send({
         content: 'Generating proposal poll...',
      });

      // client.emit('newProposal', interaction, testProposal);
      client.emit('newProposal', message, testProposal);

      // if (false) {

      // if (process.env.DEPLOY_STAGE === 'development') {
      if (process.env.DEPLOY_STAGE === 'production') {
         // AGORA + NCD TESTS
         const ncdChannelId = process.env.NCD_CHANNEL_ID;
         const agoraChannelId = process.env.AGORA_CHANNEL_ID;

         const ncdChannel = guildCache
            .get(guildId)
            .channels.cache.get(ncdChannelId);

         const agoraChannel = guildCache
            .get(guildId)
            .channels.cache.get(agoraChannelId);

         const channelList = [nounsGovChannel, ncdChannel, agoraChannel];

         const promises = channelList.map(async channel => {
            let message = await channel.send({
               content: 'New proposal data...',
            });

            return message;
         });

         const resolved = await Promise.all(promises);

         resolved.forEach(message => {
            client.emit('propCreated', message, testProposal);
         });
      }

      interaction.editReply({
         content: `Dummy proposal emitted, check #${propChannel.name} to see if the poll has been generated.`,
         ephemeral: true,
      });

      Logger.info(
         'commands/nerman/poll/emit-test-proposal.js: Finished emitting a test proposal',
         {
            userId: interaction.user.id,
         },
      );
   },
};
