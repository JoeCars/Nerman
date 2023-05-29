const { Collection } = require('discord.js');

const PollChannel = require('../db/schemas/PollChannel');
const GuildConfig = require('../db/schemas/GuildConfig');
const Logger = require('../helpers/logger');

const { Types } = require('mongoose');

module.exports = {
   name: 'ready',
   once: true,
   async execute(client) {
      Logger.info(
         `events/ready.js: Ready! Logged in as ${client.user.tag} in ${process.env.NODE_ENV} mode.`
      );

      await require('../db/index.js')(client);
      await require('../utils/remindSheet.js')(client);

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
            Logger.info('events/ready.js: On VoteCast.', {
               proposalId: vote.proposalId,
               voterId: vote.voter.id,
               votes: vote.votes,
               supportDetailed: vote.supportDetailed,
               reason: vote.reason,
            });

            const nounsGovId = process.env.NOUNS_GOV_ID;

            const nounsGovChannel = guildCache
               .get(process.env.DISCORD_GUILD_ID)
               .channels.cache.get(nounsGovId);

            let message = await nounsGovChannel.send({
               content: 'Generating vote data...',
            });

            client.emit('propVoteCast', message, vote);
         });

         Nouns.on('ProposalCreatedWithRequirements', async data => {
            data.description = data.description.substring(0, 150);

            Logger.info(
               'events/ready.js: On ProposalCreatedWithRequirements.',
               {
                  id: data.id,
                  proposer: data.proposer.id,
                  startBlock: data.startBlock,
                  endBlock: data.endBlock,
                  quorumVotes: data.quorumVotes,
                  proposalThreshold: data.proposalThreshold,
                  description: data.description,
                  targets: data.targets,
                  values: data.values,
                  signatures: data.signatures,
                  calldatas: data.calldatas,
               },
            );

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
               Logger.warn(
                  'events/ready.js: On ProposalCreatedWithRequirements. No config. Exiting.',
                  {
                     id: data.id,
                     proposer: data.proposer.id,
                  }
               );
               return;
            }

            const { id: propId, description: desc } = data;

            // todo finetune thew regexp to extract title from any possible markdown
            // const titleRegex = new RegExp(
            //    /^(\#\s((\w|[0-9_\-+=.,!:`~%;_&$()*\/\[\]\{\}@\\\|])+\s+)+(\w+\s?\n?))/
            // );

            // const titleRegex = new RegExp(/^\N+/);
            const titleRegex = new RegExp(/^(\#\s(?:\S+\s?)+(?:\S+\n?))/);

            const title = desc
               .match(titleRegex)[0]
               .replaceAll(/^(#\s)|(\n+)$/g, '');
            const description = `https://nouns.wtf/vote/${propId}`;

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
            Logger.info('events/ready.js: On ProposalCanceled.', {
               id: data.id,
            });

            const nounsGovId = process.env.NOUNS_GOV_ID;

            const nounsGovChannel = guildCache
               .get(process.env.DISCORD_GUILD_ID)
               .channels.cache.get(nounsGovId);

            const status = 'Canceled';

            let message = await nounsGovChannel.send({
               content: 'Proposal status changed...',
            });

            client.emit('propStatusChange', message, status, data);
         });

         // Nouns.on('ProposalQueued', (data: nerman.EventData.ProposalQueued) => {
         Nouns.on('ProposalQueued', async data => {
            Logger.info('events/ready.js: On ProposalQueued.', {
               id: data.id,
               eta: data.eta,
            });

            const nounsGovId = process.env.NOUNS_GOV_ID;

            const nounsGovChannel = guildCache
               .get(process.env.DISCORD_GUILD_ID)
               .channels.cache.get(nounsGovId);

            const status = 'Queued';

            let message = await nounsGovChannel.send({
               content: 'Proposal status changed...',
            });

            client.emit('propStatusChange', message, status, data);
         });

         // Nouns.on('ProposalVetoed', (data: nerman.EventData.ProposalVetoed) => {
         Nouns.on('ProposalVetoed', async data => {
            Logger.info('events/ready.js: On ProposalVetoed.', {
               id: data.id,
            });

            const nounsGovId = process.env.NOUNS_GOV_ID;

            const nounsGovChannel = guildCache
               .get(process.env.DISCORD_GUILD_ID)
               .channels.cache.get(nounsGovId);

            const status = 'Vetoed';

            let message = await nounsGovChannel.send({
               content: 'Proposal status changed...',
            });

            client.emit('propStatusChange', message, status, data);
         });

         // Nouns.on(
         //    'ProposalExecuted',
         //    (data: nerman.EventData.ProposalExecuted) => {
         Nouns.on('ProposalExecuted', async data => {
            Logger.info('events/ready.js: On ProposalExecuted.', {
               id: data.id,
            });

            const nounsGovId = process.env.NOUNS_GOV_ID;

            const nounsGovChannel = guildCache
               .get(process.env.DISCORD_GUILD_ID)
               .channels.cache.get(nounsGovId);

            const status = 'Executed';

            let message = await nounsGovChannel.send({
               content: 'Proposal status changed...',
            });

            client.emit('propStatusChange', message, status, data);
         });

         Nouns.on('Transfer', async data => {
            Logger.info('events/ready.js: On Transfer.', {
               fromId: data.from.id,
               toId: data.to.id,
               tokenId: data.tokenId,
            });
            const guildId = process.env.DISCORD_GUILD_ID;
            const nounsTokenId = process.env.NOUNS_TOKEN_ID;
            const nounsTokenChannel = await guildCache
               .get(guildId)
               .channels.cache.get(nounsTokenId);

            client.emit('transferNoun', nounsTokenChannel, data);
         });

         Nouns.on('AuctionCreated', async auction => {
            Logger.info('events/ready.js: On AuctionCreated.', {
               auctionId: auction.id,
               auctionStartTime: auction.startTime,
               auctionEndTime: auctionEndTime,
            });

            const guildId = process.env.DISCORD_GUILD_ID;
            const genId = process.env.NOUNCIL_GENERAL;
            const genChannel = await guildCache
               .get(guildId)
               .channels.cache.get(genId);

            Logger.info(
               `events/ready.js: Transfer from ${data.from.id} to ${data.to.id} with token id ${data.tokenId}`,
            );

            client.emit('auctionCreated', genChannel, auction);
         });

         Nouns.on('NounCreated', async data => {
            const guildId = process.env.NOGGLES_DISCORD_ID;
            const channelId = process.env.NOGGLES_CHANNEL_ID;
            const nogglesChannel = await guildCache
               .get(guildId)
               .channels.cache.get(channelId);
            
            console.log(
               'NounsToken | NounCreated | id:' +
                  data.id +
                  ', seed: ' +
                  JSON.stringify(data.seed),
            );

            Logger.info('events/ready.js: On NounCreated.', {
               nounId: data.id,
            });

            client.emit('nounCreated', nogglesChannel, data);
         });

         Nouns.on('AuctionBid', async data => {
            Logger.info('events/ready.js: On AuctionBid.', {
               nounId: data.id,
               walletAddress: data.bidder.id,
               ethereumWeiAmount: data.amount,
               dataExtended: data.extended,
            });

            const guildId = process.env.DISCORD_GUILD_ID;
            // const nounsTokenId = process.env.NOUNS_TOKEN_ID;
            const nounsAuctionId = process.env.NOUNS_AUCTION_ID;
            const nounsAuctionChannel = await guildCache
               .get(guildId)
               .channels.cache.get(nounsAuctionId);

            client.emit('auctionBid', nounsAuctionChannel, data);
         });

         // *************************************************************
         //
         // EXAMPLE METADATA
         //
         // *************************************************************

         async function testing(nounId) {
            Logger.info('events/ready.js: Testing noun retrieval.', {
               nounId: nounId,
            });

            // Look up Owner of Noun by id
            const ownerAddress = await Nouns.NounsToken.Contract.ownerOf(
               nounId,
            );

            // Look up ENS from address
            const ownerEns = await Nouns.ensReverseLookup(ownerAddress);

            // Look up delegate from ownerAddress
            const delegateAddress = await Nouns.NounsToken.Contract.delegates(
               ownerAddress,
            );

            // Look up ENS from address
            const delegateEns = await Nouns.ensReverseLookup(delegateAddress);

            // Look up current votes for ownerAddress
            const votingPower = await Nouns.NounsToken.Contract.getCurrentVotes(
               delegateAddress,
            );

            Logger.debug('events/ready.js: Checking owner information', {
               nounId: nounId,
               ownerAddress: ownerAddress,
               ownerEns: ownerEns ?? 'not found',
               delegateAddress: delegateAddress,
               delegateEns: delegateEns ?? 'not found',
               votingPower: votingPower,
            });

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

               Logger.debug('events/ready.js: Checking bid information', {
                  nounId: nounId,
                  bidId: bid.id,
                  bidAmount: bid.amount,
                  newOwner: name,
                  dateOfBid: bid.date.toLocaleString(),
               });
            }
         }
      }

      runNouns().catch(error => {
         Logger.error('events/ready.js: Received an error.', {
            error: error,
         });
      });

      try {
         client.guildConfigs = new Collection();

         const clientGuilds = await client.guilds.fetch();

         for (const [key, _] of clientGuilds) {
            const gConfig = await GuildConfig.findOne({ guildId: key })
               .populate('pollChannels')
               .exec();

            client.guildConfigs.set(key, gConfig);
         }
      } catch (error) {
         Logger.error('events/ready.js: Received an error.', {
            error: error,
         });
      }
   },
};
