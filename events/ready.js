const PollChannel = require('../db/schemas/PollChannel');

module.exports = {
   name: 'ready',
   once: true,
   async execute(client) {
      console.log(
         `Ready! Logged in as ${client.user.tag}: ` + process.env.NODE_ENV
      );

      require('../db/index.js')(client);
      require('../utils/remindSheet.js')(client);

      const _StateOfNouns = import('stateofnouns');

      async function runSON() {
         const StateOfNouns = await _StateOfNouns;
         if (typeof process.env.JSON_RPC_API_URL === 'string') {
            console.log('YAY STRING');
            StateOfNouns.init(process.env.JSON_RPC_API_URL);
         }

         const {
            guilds: { cache: guildCache },
         } = client;

         // *************************************************************
         //
         // NounsDAO Events
         //
         // *************************************************************

         StateOfNouns.on('VoteCast', vote => {
            console.log(
               'NounsDAO | VoteCast | id:' +
                  vote.proposalId +
                  ',  voter: ' +
                  vote.voter.id +
                  ', votes: ' +
                  vote.votes +
                  ' , supportDetailed: ' +
                  vote.supportDetailed +
                  ', reason: ' +
                  vote.reason
            );
         });

         StateOfNouns.on('ProposalCreatedWithRequirements', async data => {
            data.description = data.description.substring(0, 150);
            console.log(
               'NounsDAO | ProposalCreatedWithRequirements | id:' +
                  data.id +
                  ', proposer: ' +
                  data.proposer.id +
                  ', startBlock: ' +
                  data.startBlock +
                  ', endBlock: ' +
                  data.endBlock +
                  'quorumVotes ' +
                  data.quorumVotes +
                  ', proposalThreshold: ' +
                  data.proposalThreshold +
                  ', description: ' +
                  data.description
            );

            console.log('targets: ' + JSON.stringify(data.targets));
            console.log('values: ' + JSON.stringify(data.values));
            console.log('signatures: ' + JSON.stringify(data.signatures));
            console.log('calldatas: ' + JSON.stringify(data.calldatas));

            const propChannelId =
               process.env.DEPLOY_STAGE === 'staging'
                  ? process.env.TESTNERMAN_NOUNCIL_CHAN_ID
                  : process.env.DEVNERMAN_NOUNCIL_CHAN_ID;

            const propChannel = await guildCache
               .get(process.env.DISCORD_GUILD_ID)
               .channels.cache.get(propChannelId);
            const configExists = !!(await PollChannel.countDocuments({
               channelId: propChannelId,
            }).exec());
            if (!configExists) {
               l('NO CHANNEL CONFIG ---- RETURNING');
               return;
            }

            const { id: propId, description: desc } = data;

            console.log('ready.js -- propId', { propId });
            console.log('ready.js -- desc', { desc });

            const titleRegex = new RegExp(
               /^(\#\s(\w+\s)+--\s(\w+\s)+(\w+\s+\n?))/
            );
            const title = desc
               .match(titleRegex)[0]
               .replaceAll(/^(#\s)|(\n+)$/g, '');
            const description = `https://nouns.wtf/vote/${propId}`;

            console.log('ready.js -- title', { title });
            console.log('ready.js -- description', { description });

            let message = await propChannel.send({
               content: 'Generating proposal...',
            });

            client.emit('newProposal', message, data);
         });

         // // *************************************************************
         // //
         // // NounsAuctionHouse Events
         // //
         // // *************************************************************

         StateOfNouns.on('AuctionBid', data => {
            console.log(
               'NounsAuctionHouse | AuctionBid ' +
                  data.id +
                  ' ' +
                  data.bidder.id +
                  ' ' +
                  data.amount +
                  ' ' +
                  data.extended
            );
         });
      }

      runSON().catch(err => {
         console.log(err);
      });
   },
};
