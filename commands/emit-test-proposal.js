const { SlashCommandBuilder } = require('@discordjs/builders');
const testProposal = require('../scratchcode/testGraphSample.json');
const PollChannel = require('../db/schemas/PollChannel');
const { log: l, time: t, timeEnd: te } = console;

const propChannelId =
   process.env.DEPLOY_STAGE === 'staging'
      ? process.env.TESTNERMAN_NOUNCIL_CHAN_ID
      : process.env.DEVNERMAN_NOUNCIL_CHAN_ID;

module.exports = {
   data: new SlashCommandBuilder()
      .setName('emit-test-proposal')
      .setDescription(
         "Mimic Joel's event emitter for a new proposal and using some old data from a prior Nouns prop."
      ),

   async execute(interaction) {
      const {
         client,
         guild: {
            channels: { cache: channelCache },
         },
         member: {
            roles: { cache: roleCache },
         },
      } = interaction;

      await interaction.deferReply({ ephemeral: true });

      if (!roleCache.has('919784986641575946')) return;

      const propChannel = await channelCache.get(propChannelId);

      const channelConfig = await PollChannel.findOne(
         {
            channelId: propChannelId,
         },
         '_id allowedRoles quorum duration'
      ).exec();

      let message = await propChannel.send({content: 'Generating proposal poll...'});

      // client.emit('newProposal', interaction, testProposal);
      client.emit('newProposal', message, testProposal);
   },
};
