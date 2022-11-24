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

      // const _StateOfNouns = import('stateofnouns');
      const _nerman = import('stateofnouns');

      async function runNouns() {
         const nerman = await _nerman;
         const Nouns = new nerman.Nouns(process.env.JSON_RPC_API_URL);

         const {
            guilds: { cache: guildCache },
         } = client;

         // *************************************************************
         //
         // EXAMPLE EVENTS
         //
         // *************************************************************

         Nouns.on('VoteCast', vote => {
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

         Nouns.on('ProposalCreatedWithRequirements', async data => {
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
               /^(\#\s((\w|[0-9_\-+=.,!:`~%;_&$()*/\[\]\{\}@\\\|])+\s+)+(\w+\s?\n?))/
            );
            // const titleRegex = new RegExp(
            //    /^(\#\s(\w+\s)+\s(\w+\s)+(\w+\s+\n?))/
            // );
// # PropBox: A Nouns Proposal Incubator\n\n## TL;DR\n\nUsing lessons from a Nouncil trial program, we will set up a robust incubator that will help the best

            // /^(\#\s((\w|[0-9_\-.,\|])+\s+)+(\w+\s?\n?))/
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

         Nouns.on('AuctionBid', data => {
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

         // *************************************************************
         //
         // EXAMPLE METADATA
         //
         // *************************************************************

         async function testing(nounId) {
            console.log('Getting Data for Noun ' + nounId);

            // Look up Owner of Noun by id
            const ownerAddress = await Nouns.NounsToken.Contract.ownerOf(
               nounId
            );

            // Look up ENS from address
            const ownerEns = await Nouns.ensReverseLookup(ownerAddress);

            // Look up delegate from ownerAddress
            const delegateAddress = await Nouns.NounsToken.Contract.delegates(
               ownerAddress
            );

            // Look up ENS from address
            const delegateEns = await Nouns.ensReverseLookup(delegateAddress);

            // Look up current votes for ownerAddress
            const votingPower = await Nouns.NounsToken.Contract.getCurrentVotes(
               delegateAddress
            );

            console.log('Owner: ' + ownerAddress);
            if (ownerEns) {
               console.log('ENS found: ' + ownerEns);
            }
            console.log('Delegate: ' + delegateAddress);
            if (delegateEns) {
               console.log('ENS found: ' + delegateEns);
            }
            console.log('Voting Power:  ' + votingPower.toNumber());

            // Get Final Bid Data

            const bid = await Nouns.NounsAuctionHouse.getLatestBidData(nounId);

            //   bid : {
            //     id: number,
            //     block: numbre,
            //     date: Date,
            //     amount: number (ETH),
            //     address: string,
            //     ens: string
            // }

            if (bid != null) {
               const name = bid.ens != null ? bid.ens : bid.address;
               console.log(
                  'Noun ' +
                     bid.id +
                     ' sold for ' +
                     bid.amount +
                     ' ETH to ' +
                     name +
                     'on ' +
                     bid.date.toLocaleString()
               );
            }
         }

         testing(2);
      }

      runNouns().catch(err => {
         console.log(err);
      });
   },
};
