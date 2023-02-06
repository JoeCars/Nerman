const PollChannel = require('../db/schemas/PollChannel');
const { log: l, table: tbl } = console;

module.exports = {
   name: 'ready',
   once: true,
   async execute(client) {
      l(`Ready! Logged in as ${client.user.tag}: ` + process.env.NODE_ENV);

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

         // const testingGetAddress = await Nouns.getAddress('skilift.eth');
         // l('HEY LOOK AT ME', testingGetAddress);

         // const testingEnsReverseLookup = await Nouns
         // *************************************************************
         //
         // EXAMPLE EVENTS
         //
         // *************************************************************

         Nouns.on('VoteCast', async vote => {
            l('STATE OF NOUNS VOTE CAST -- VOTE INFO\n', vote);

            const nounsGovId = process.env.NOUNS_GOV_ID;
            l('ready.js -- VoteCast : \n', { nounsGovId });

            const nounsGovChannel = guildCache
               .get(process.env.DISCORD_GUILD_ID)
               .channels.cache.get(nounsGovId);
            l('ready.js -- VoteCast : \n', { nounsGovChannel });

            l(
               'ready.js -- VoteCast : \n',
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

            let message = await nounsGovChannel.send({
               content: 'Generating vote data...',
            });

            client.emit('propVoteCast', message, vote);
         });

         Nouns.on('ProposalCreatedWithRequirements', async data => {
            data.description = data.description.substring(0, 150);
            l(
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

            l('targets: ' + JSON.stringify(data.targets));
            l('values: ' + JSON.stringify(data.values));
            l('signatures: ' + JSON.stringify(data.signatures));
            l('calldatas: ' + JSON.stringify(data.calldatas));

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

            l('ready.js -- propId', { propId });
            l('ready.js -- desc', { desc });

            // todo finetune thew regexp to extract title from any possible markdown
            // const titleRegex = new RegExp(
            //    /^(\#\s((\w|[0-9_\-+=.,!:`~%;_&$()*\/\[\]\{\}@\\\|])+\s+)+(\w+\s?\n?))/
            // );

            // const titleRegex = new RegExp(/^\N+/);
            const titleRegex = new RegExp(/^(\#\s(?:\S+\s)+(?:\S+\n?))/);

            const title = desc
               .match(titleRegex)[0]
               .replaceAll(/^(#\s)|(\n+)$/g, '');
            const description = `https://nouns.wtf/vote/${propId}`;

            l('ready.js -- title', { title });
            l('ready.js -- description', { description });

            let message = await propChannel.send({
               content: 'Generating proposal...',
            });

            client.emit('newProposal', message, data);
         });

         // Nouns.on(
         //    'ProposalCreatedWithRequirements',
         //    (data: nerman.EventData.ProposalCreatedWithRequirements) => {
         // Nouns.on('ProposalCreatedWithRequirements', async data => {
         //    l('ready.js -- NOUNS.ON : PROPOSAL CREATED WITH REQUIREMENTS');
         //    l(data);

         //    l({
         //       'prop id': data.id,
         //       'proposer address': data.proposer.id,
         //       startBlock: data.startBlock,
         //       endBlock: data.endBlock,
         //       quorumVotes: data.quorumVotes,
         //       proposalThreshold: data.proposalThreshold,
         //       description: data.description,
         //       // values: data.values, // (add these to get total ETH?)
         //    });
         //    // prop id: data.id
         //    // proposer address:data.proposer.id
         //    // data.startBlock, data.endBlock
         //    // data.quorumVotes
         //    // data.proposalThreshold
         //    // description: data.description);
         //    // data.values (add these to get total ETH?)
         // });

         Nouns.on('AuctionBid', async data => {
            l('ready.js -- NOUNS.ON : AUCTION BID');
            l(
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

         // Nouns.on('VoteCast', (vote: nerman.EventData.VoteCast) => {
         // Nouns.on('VoteCast', async vote => {
         //    l('ready.js -- NOUNS.ON : VOTE CAST');
         //    // Prop Id:          vote.proposalId
         //    // Voter Address:    vote.voter.id
         //    // Vote:             vote.votes
         //    // supportDetailed:  vote.supportDetailed 0=against, 1=for, 2=abstain
         //    // Reason:           vote.reason

         //    l({
         //       'Prop Id': vote.proposalId,
         //       'Voter Address': vote.voter.id,
         //       Vote: vote.votes,
         //       supportDetailed: vote.supportDetailed, // 0=against, 1=for, 2=abstain,
         //       Reason: vote.reason,
         //    });

         //    tbl({
         //       'Prop Id': vote.proposalId,
         //       'Voter Address': vote.voter.id,
         //       Vote: vote.votes,
         //       supportDetailed: vote.supportDetailed, // 0=against, 1=for, 2=abstain,
         //       Reason: vote.reason,
         //    });
         // });

         // Nouns.on(
         //    'ProposalCanceled',
         //    (data: nerman.EventData.ProposalCanceled) => {
         Nouns.on('ProposalCanceled', async data => {
            l('ready.js -- NOUNS.ON : PROPOSAL CANCELED');

            const nounsGovId = process.env.NOUNS_GOV_ID;

            l({ nounsGovId });

            const nounsGovChannel = guildCache
               .get(process.env.DISCORD_GUILD_ID)
               .channels.cache.get(nounsGovId);

            const status = 'Canceled';

            l({ nounsGovChannel });

            l('NounsDAO | ProposalCanceled | id:' + data.id);

            let message = await nounsGovChannel.send({
               content: 'Proposal status changed...',
            });

            client.emit('propStatusChange', message, status, data);
         });

         // Nouns.on('ProposalQueued', (data: nerman.EventData.ProposalQueued) => {
         Nouns.on('ProposalQueued', async data => {
            l('ready.js -- NOUNS.ON : PROPOSAL QUEUED');

            const nounsGovId = process.env.NOUNS_GOV_ID;

            l({ nounsGovId });

            const nounsGovChannel = guildCache
               .get(process.env.DISCORD_GUILD_ID)
               .channels.cache.get(nounsGovId);

            l({ nounsGovChannel });

            const status = 'Queued';

            l(
               'NounsDAO | ProposalQueued | id:' +
                  data.id +
                  ', eta: ' +
                  data.eta
            );

            let message = await nounsGovChannel.send({
               content: 'Proposal status changed...',
            });

            client.emit('propStatusChange', message, status, data);
         });

         // Nouns.on('ProposalVetoed', (data: nerman.EventData.ProposalVetoed) => {
         Nouns.on('ProposalVetoed', async data => {
            l('ready.js -- NOUNS.ON : PROPOSAL VETOED');

            const nounsGovId = process.env.NOUNS_GOV_ID;

            l({ nounsGovId });

            const nounsGovChannel = guildCache
               .get(process.env.DISCORD_GUILD_ID)
               .channels.cache.get(nounsGovId);

            l({ nounsGovChannel });

            const status = 'Vetoed';

            l('NounsDAO | ProposalVetoed | id:' + data.id);

            let message = await nounsGovChannel.send({
               content: 'Proposal status changed...',
            });

            client.emit('propStatusChange', message, status, data);
         });

         // Nouns.on(
         //    'ProposalExecuted',
         //    (data: nerman.EventData.ProposalExecuted) => {
         Nouns.on('ProposalExecuted', async data => {
            l('ready.js -- NOUNS.ON : PROPOSAL EXECUTED');

            const nounsGovId = process.env.NOUNS_GOV_ID;

            l({ nounsGovId });

            const nounsGovChannel = guildCache
               .get(process.env.DISCORD_GUILD_ID)
               .channels.cache.get(nounsGovId);

            l({ nounsGovChannel });

            const status = 'Executed';

            l('NounsDAO | ProposalExecuted | id:' + data.id);

            let message = await nounsGovChannel.send({
               content: 'Proposal status changed...',
            });

            client.emit('propStatusChange', message, status, data);
         });

         // *************************************************************
         //
         // EXAMPLE METADATA
         //
         // *************************************************************

         async function testing(nounId) {
            l('ready.js -- TESTING FUNCTION FOR LOOKING UP NOUN');

            l('Getting Data for Noun ' + nounId);

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

            l('Owner: ' + ownerAddress);
            if (ownerEns) {
               l('ENS found: ' + ownerEns);
            }
            l('Delegate: ' + delegateAddress);
            if (delegateEns) {
               l('ENS found: ' + delegateEns);
            }
            l('Voting Power:  ' + votingPower.toNumber());

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
               l(
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

         // testing(2);
      }

      runNouns().catch(err => {
         l(err);
      });

      // l({ client });
      // l('CHECKING GUILDS', client.guilds);
      l('CHECKING GUILDS CACHE', client.guilds.cache);
      l('CHECKING GUILDS FETCH', await client.guilds.fetch());
   },
};
