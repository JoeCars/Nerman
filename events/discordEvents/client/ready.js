const { Collection, Client, Channel, TextChannel } = require('discord.js');

const GuildConfig = require('../../../db/schemas/GuildConfig');
const FeedConfig = require('../../../db/schemas/FeedConfig');
const Poll = require('../../../db/schemas/Poll');
const Logger = require('../../../helpers/logger');
const { extractVoteChange } = require('../../../views/embeds/delegateChanged');
const shortenAddress = require('../../../helpers/nouns/shortenAddress');
const NounsProposalForum = require('../../../db/schemas/NounsProposalForum');
const NounsCandidateForum = require('../../../db/schemas/NounsCandidateForum');
const {
   fetchForumChannel,
   fetchForumThread,
   fetchCandidateForumThread,
} = require('../../../helpers/forum');
const Proposal = require('../../../db/schemas/Proposal');

const REASON_LENGTH_LIMIT = 3000;

// https://discord.com/developers/docs/topics/opcodes-and-status-codes
const UNKNOWN_CHANNEL_ERROR_CODE = 10003;

module.exports = {
   name: 'ready',
   once: true,
   /**
    *
    * @param {Client} client
    */
   async execute(client) {
      Logger.info(
         `events/ready.js: Ready! Logged in as ${client.user.tag} in ${process.env.DEPLOY_STAGE} mode.`,
      );

      await require('../../../db/index.js')(client);

      const _nerman = import('nerman');

      async function runNouns() {
         const nerman = await _nerman;
         const Nouns = client.libraries.get('Nouns');

         const nounsNymz = new nerman.NounsNymz();
         client.libraries.set('NounsNymz', nounsNymz);

         const federationNounsPool = new nerman.FederationNounsPool(
            process.env.ALCHEMY_WEBSOCKETS,
         );
         client.libraries.set('FederationNounsPool', federationNounsPool);

         const nounsForkToken = new nerman.NounsForkToken(Nouns.provider);
         client.libraries.set('NounsForkToken', nounsForkToken);

         const nounsForkAuctionHouse = new nerman.NounsForkAuctionHouse(
            Nouns.provider,
         );
         client.libraries.set('NounsForkAuctionHouse', nounsForkAuctionHouse);

         const nounsFork = new nerman.NounsFork(Nouns.provider);
         client.libraries.set('NounsFork', nounsFork);

         const propdates = new nerman.Propdates(Nouns.provider);
         client.libraries.set('Propdates', propdates);

         const {
            guilds: { cache: guildCache },
         } = client;

         // *************************************************************
         //
         // EXAMPLE EVENTS
         //
         // *************************************************************

         federationNounsPool.on('BidPlaced', async data => {
            Logger.info('ready.js: On Federation BidPlaced.', {
               propId: `${data.propId}`,
               bidder: data.bidder,
               support: data.support,
               amount: data.amount,
            });

            if (data.reason && data.reason.length > REASON_LENGTH_LIMIT) {
               data.reason =
                  data.reason.substring(0, REASON_LENGTH_LIMIT) + '...';
            }

            data.supportVote = ['AGAINST', 'FOR', 'ABSTAIN'][data.support];
            data.bidderName =
               (await Nouns.ensReverseLookup(data.bidder)) ??
               (await shortenAddress(data.bidder));
            data.proposalTitle = await fetchProposalTitle(data.propId);

            const GOVERNANCE_POOL_VOTING_ADDRESS = `0x6b2645b468A828a12fEA8C7D644445eB808Ec2B1`;
            const currentBlock = await Nouns.provider.getBlockNumber();
            const proposal = await Nouns.NounsDAO.Contract.proposals(
               Number(data.propId),
            );

            let votes = 0;
            if (proposal.startBlock <= currentBlock) {
               // Grabs vote at the snapshot.
               votes = await Nouns.NounsToken.Contract.getPriorVotes(
                  GOVERNANCE_POOL_VOTING_ADDRESS,
                  proposal.startBlock,
               );
            } else {
               votes = await Nouns.NounsToken.Contract.getCurrentVotes(
                  GOVERNANCE_POOL_VOTING_ADDRESS,
               );
            }
            data.voteNumber = votes;

            data.nounsForumType = 'FederationBidPlaced';

            sendToChannelFeeds('federationBidPlaced', data, client);
            sendToChannelFeeds('threadFederationBidPlaced', data, client);
            sendToNounsForum(data.propId, data, client);
         });

         federationNounsPool.on('VoteCast', async data => {
            Logger.info('ready.js: On Federation VoteCast.', {
               propId: `${data.propId}`,
               bidder: data.bidder,
               support: data.support,
               amount: data.amount,
            });

            if (data.reason && data.reason.length > REASON_LENGTH_LIMIT) {
               data.reason =
                  data.reason.substring(0, REASON_LENGTH_LIMIT) + '...';
            }

            data.supportVote = ['AGAINST', 'FOR', 'ABSTAIN'][data.support];
            data.bidderName =
               (await Nouns.ensReverseLookup(data.bidder)) ??
               (await shortenAddress(data.bidder));
            data.proposalTitle = await fetchProposalTitle(data.propId);

            const GOVERNANCE_POOL_VOTING_ADDRESS = `0x6b2645b468A828a12fEA8C7D644445eB808Ec2B1`;
            const voting = await Nouns.NounsDAO.Contract.getReceipt(
               data.propId,
               GOVERNANCE_POOL_VOTING_ADDRESS,
            );
            data.voteNumber = voting.votes;

            data.nounsForumType = 'FederationVoteCast';

            sendToChannelFeeds('federationVoteCast', data, client);
            sendToChannelFeeds('threadFederationVoteCast', data, client);
            sendToNounsForum(data.propId, data, client);
         });

         Nouns.on('AuctionEnd', async data => {
            let bidData = undefined;
            if (typeof data === 'object') {
               bidData = data;
            } else if (typeof data === 'number') {
               bidData = await Nouns.NounsAuctionHouse.getLatestBidData(data);
            }

            if (!bidData) {
               return Logger.error('ready.js: No bid data found.');
            }

            Logger.info('ready.js: On AuctionEnd.', {
               nounId: bidData.id,
               bidAmount: bidData.amount,
               address: bidData.address,
            });

            bidData.bidderName = bidData.ens || shortenAddress(bidData.address);

            sendToChannelFeeds('auctionEnd', bidData, client);
         });

         Nouns.on('DelegateChanged', async data => {
            Logger.info('ready.js: On DelegateChanged.', {
               delegator: data.delegator.id,
               oldDelegate: data.fromDelegate.id,
               newDelegate: data.toDelegate.id,
               event: data.event,
            });

            data.delegator.name =
               (await Nouns.ensReverseLookup(data.delegator.id)) ??
               (await shortenAddress(data.delegator.id));
            data.fromDelegate.name =
               (await Nouns.ensReverseLookup(data.fromDelegate.id)) ??
               (await shortenAddress(data.fromDelegate.id));
            data.toDelegate.name =
               (await Nouns.ensReverseLookup(data.toDelegate.id)) ??
               (await shortenAddress(data.toDelegate.id));

            let numOfVotesChanged = 0;
            try {
               // The number of votes being changes is stored in receipt logs index 1 and 2.
               // It is formatted as a single hex, where the first 64 digits after 0x is the previous vote count.
               // And the second 64 digits after 0x is the new vote count of the delegate.
               // To see this in detail, follow the link of the delegate changed event and check the receipt logs.
               const event = data.event;
               const receipt = await event.getTransactionReceipt();
               if (receipt.logs[1]) {
                  const hexData = receipt.logs[1].data;
                  numOfVotesChanged = extractVoteChange(hexData);
               }
            } catch (error) {
               Logger.error(
                  "events/discordEvents/client/ready.js: On DelegateChanged. There's been an error.",
                  {
                     error: error,
                  },
               );
            }
            data.numOfVotesChanged = numOfVotesChanged;

            if (numOfVotesChanged) {
               sendToChannelFeeds('delegateChangedNoZero', data, client);
            }
            sendToChannelFeeds('delegateChanged', data, client);
         });

         nounsNymz.on('NewPost', async post => {
            Logger.info('ready.js: On NewPost.', {
               postId: post.id,
               postTitle: post.title,
            });

            sendToChannelFeeds('newPost', post, client);
         });

         Nouns.on('VoteCast', async vote => {
            Logger.info('events/ready.js: On VoteCast.', {
               proposalId: Number(vote.proposalId),
               voterId: vote.voter.id,
               votes: Number(vote.votes),
               supportDetailed: vote.supportDetailed,
               reason: vote.reason,
            });

            if (vote.reason && vote.reason.length > REASON_LENGTH_LIMIT) {
               vote.reason =
                  vote.reason.substring(0, REASON_LENGTH_LIMIT) + '...';
            }

            vote.proposalTitle = await fetchProposalTitle(vote.proposalId);
            vote.voter.name =
               (await Nouns.ensReverseLookup(vote.voter.id)) ??
               (await shortenAddress(vote.voter.id));
            vote.choice = ['AGAINST', 'FOR', 'ABSTAIN'][vote.supportDetailed];
            vote.nounsForumType = 'PropVoteCast';

            if (Number(vote.votes) === 0) {
               sendToChannelFeeds('propVoteCastOnlyZero', vote, client);
            } else {
               sendToChannelFeeds('propVoteCast', vote, client);
               sendToChannelFeeds('threadVote', vote, client);
            }

            sendToNounsForum(vote.proposalId, vote, client);
         });

         Nouns.on('ProposalCreatedWithRequirements', async data => {
            data.description = data.description.substring(0, 500);

            try {
               const proposal = await Proposal.tryCreateProposal(data);
               data.proposalTitle = proposal.fullTitle;
            } catch (error) {
               Logger.error('events/ready.js: Error creating a proposal.');
            }

            Logger.info(
               'events/ready.js: On ProposalCreatedWithRequirements.',
               {
                  id: `${data.id}`,
                  proposer: `${data.proposer.id}`,
                  startBlock: data.startBlock,
                  endBlock: data.endBlock,
                  quorumVotes: `${data.quorumVotes}`,
                  proposalThreshold: `${data.proposalThreshold}`,
                  description: data.description,
                  targets: `${data.targets}`,
                  values: `${data.values}`,
                  signatures: `${data.signatures}`,
                  calldatas: `${data.calldatas}`,
               },
            );

            data.nounsForumType = 'PropCreated';

            sendToChannelFeeds('newProposalPoll', data, client);
            sendToChannelFeeds('propCreated', data, client);
            sendToNounsForum(data.id, data, client);
         });

         Nouns.on('ProposalCanceled', async data => {
            Logger.info('events/ready.js: On ProposalCanceled.', {
               id: `${data.id}`,
            });

            data.status = 'Canceled';
            data.proposalTitle = await fetchProposalTitle(data.id);
            data.nounsForumType = 'PropStatusChange';

            sendToChannelFeeds('propStatusChange', data, client);
            sendToChannelFeeds('threadStatusChange', data, client);
            sendToNounsForum(data.id, data, client);
         });

         // Nouns.on('ProposalQueued', (data: nerman.EventData.ProposalQueued) => {
         Nouns.on('ProposalQueued', async data => {
            Logger.info('events/ready.js: On ProposalQueued.', {
               id: `${data.id}`,
               eta: `${data.eta}`,
            });

            data.status = 'Queued';
            data.proposalTitle = await fetchProposalTitle(data.id);
            data.nounsForumType = 'PropStatusChange';

            sendToChannelFeeds('propStatusChange', data, client);
            sendToChannelFeeds('threadStatusChange', data, client);
            sendToNounsForum(data.id, data, client);
         });

         // Nouns.on('ProposalVetoed', (data: nerman.EventData.ProposalVetoed) => {
         Nouns.on('ProposalVetoed', async data => {
            Logger.info('events/ready.js: On ProposalVetoed.', {
               id: `${data.id}`,
            });

            data.status = 'Vetoed';
            data.proposalTitle = await fetchProposalTitle(data.id);
            data.nounsForumType = 'PropStatusChange';

            sendToChannelFeeds('propStatusChange', data, client);
            sendToChannelFeeds('threadStatusChange', data, client);
            sendToNounsForum(data.id, data, client);
         });

         Nouns.on('ProposalExecuted', async data => {
            Logger.info('events/ready.js: On ProposalExecuted.', {
               id: `${data.id}`,
            });

            data.status = 'Executed';
            data.proposalTitle = await fetchProposalTitle(data.id);
            data.nounsForumType = 'PropStatusChange';

            sendToChannelFeeds('propStatusChange', data, client);
            sendToChannelFeeds('threadStatusChange', data, client);
            sendToNounsForum(data.id, data, client);
         });

         Nouns.on('Transfer', async data => {
            Logger.info('events/ready.js: On Transfer.', {
               fromId: `${data.from.id}`,
               toId: `${data.to.id}`,
               tokenId: `${data.tokenId}`,
            });

            data.from.name =
               (await Nouns.ensReverseLookup(data.from.id)) ??
               (await shortenAddress(data.from.id));
            data.to.name =
               (await Nouns.ensReverseLookup(data.to.id)) ??
               (await shortenAddress(data.to.id));

            sendToChannelFeeds('transferNoun', data, client);
         });

         Nouns.on('AuctionCreated', async auction => {
            Logger.info('events/ready.js: On AuctionCreated.', {
               auctionId: `${auction.id}`,
               auctionStartTime: `${auction.startTime}`,
               auctionEndTime: `${auction.endTime}`,
            });

            sendToChannelFeeds('auctionCreated', auction, client);
         });

         Nouns.on('NounCreated', async data => {
            Logger.info('events/ready.js: On NounCreated.', {
               nounId: `${data.id}`,
            });

            sendToChannelFeeds('nounCreated', data, client);
         });

         Nouns.on('AuctionBid', async data => {
            Logger.info('events/ready.js: On AuctionBid.', {
               nounId: `${data.id}`,
               walletAddress: `${data.bidder.id}`,
               ethereumWeiAmount: `${data.amount}`,
               dataExtended: `${data.extended}`,
            });

            data.bidder.name =
               (await Nouns.ensReverseLookup(data.bidder.id)) ??
               (await shortenAddress(data.bidder.id));

            sendToChannelFeeds('auctionBid', data, client);
         });

         // =============================================================
         // Nouns DAO Data
         // =============================================================

         Nouns.on('CandidateFeedbackSent', async data => {
            Logger.info('ready.js: On CandidateFeedbackSent', {
               msgSender: data.msgSender.id,
               proposer: data.proposer.id,
               slug: data.slug,
               support: data.support,
               reason: data.reason,
            });

            data.msgSender.name =
               (await Nouns.ensReverseLookup(data.msgSender.id)) ??
               (await shortenAddress(data.msgSender.id));
            data.proposer.name =
               (await Nouns.ensReverseLookup(data.proposer.id)) ??
               (await shortenAddress(data.proposer.id));
            data.supportVote = ['AGAINST', 'FOR', 'ABSTAIN'][data.support];
            data.nounsForumType = 'CandidateFeedbackSent';

            sendToChannelFeeds('candidateFeedbackSent', data, client);
            sendToCandidateForum(data.slug, data, client);
         });

         Nouns.on('FeedbackSent', async data => {
            Logger.info('ready.js: On FeedbackSent', {
               msgSender: data.msgSender.id,
               proposalId: data.proposalId,
               support: data.support,
               reason: data.reason,
            });

            data.msgSender.name =
               (await Nouns.ensReverseLookup(data.msgSender.id)) ??
               (await shortenAddress(data.msgSender.id));
            data.supportVote = ['AGAINST', 'FOR', 'ABSTAIN'][data.support];
            data.proposalTitle = await fetchProposalTitle(data.proposalId);
            data.nounsForumType = 'FeedbackSent';

            sendToChannelFeeds('feedbackSent', data, client);
            sendToChannelFeeds('threadFeedbackSent', data, client);
            sendToNounsForum(data.proposalId, data, client);
         });

         Nouns.on('ProposalCandidateCanceled', async data => {
            Logger.info('ready.js: On ProposalCandidateCanceled', {
               msgSender: data.msgSender.id,
               slug: data.slug,
               reason: data.reason,
            });

            data.msgSender.name =
               (await Nouns.ensReverseLookup(data.msgSender.id)) ??
               (await shortenAddress(data.msgSender.id));
            data.proposer = data.msgSender;
            data.nounsForumType = 'ProposalCandidateCanceled';

            sendToChannelFeeds('proposalCandidateCanceled', data, client);
            sendToCandidateForum(data.slug, data, client);
         });

         Nouns.on('ProposalCandidateCreated', async data => {
            data.description = data.description.substring(0, 500);
            Logger.info('ready.js: On ProposalCandidateCreated.', {
               slug: data.slug,
               proposer: data.msgSender.id,
               description: data.description,
            });

            data.msgSender.name =
               (await Nouns.ensReverseLookup(data.msgSender.id)) ??
               (await shortenAddress(data.msgSender.id));
            data.proposer = data.msgSender;
            data.nounsForumType = 'ProposalCandidateCreated';

            sendToChannelFeeds('proposalCandidateCreated', data, client);
            sendToCandidateForum(data.slug, data, client);
         });

         Nouns.on('ProposalCandidateUpdated', async data => {
            Logger.info('ready.js: On ProposalCandidateUpdated', {
               msgSender: data.msgSender.id,
               slug: data.slug,
               reason: data.reason,
            });

            data.msgSender.name =
               (await Nouns.ensReverseLookup(data.msgSender.id)) ??
               (await shortenAddress(data.msgSender.id));
            data.proposer = data.msgSender;
            data.nounsForumType = 'ProposalCandidateUpdated';

            sendToChannelFeeds('proposalCandidateUpdated', data, client);
            sendToCandidateForum(data.slug, data, client);
         });

         Nouns.on('SignatureAdded', async data => {
            if (data.reason > REASON_LENGTH_LIMIT) {
               data.reason =
                  data.reason.substring(0, REASON_LENGTH_LIMIT).trim() + '...';
            }
            Logger.info('ready.js: On SignatureAdded.', {
               slug: data.slug,
               proposer: data.proposer.id,
               signer: data.signer.id,
               reason: data.reason,
            });

            data.proposer.name =
               (await Nouns.ensReverseLookup(data.proposer.id)) ??
               (await shortenAddress(data.proposer.id));
            data.signer.name =
               (await Nouns.ensReverseLookup(data.signer.id)) ??
               (await shortenAddress(data.signer.id));
            data.votes = await Nouns.NounsToken.Contract.getCurrentVotes(
               data.signer.id,
            );
            data.nounsForumType = 'SignatureAdded';

            sendToChannelFeeds('signatureAdded', data, client);
            sendToCandidateForum(data.slug, data, client);
         });

         // =============================================================
         // Nouns DAO Fork
         // =============================================================

         Nouns.on('DAOWithdrawNounsFromEscrow', async data => {
            Logger.info('ready.js: On WithdrawNounsFromEscrow', {
               tokenIds: data.tokenIds,
               to: data.to.id,
            });

            data.to.name =
               (await Nouns.ensReverseLookup(data.to.id)) ??
               (await shortenAddress(data.to.id));

            sendToChannelFeeds('withdrawNounsFromEscrow', data, client);
         });

         Nouns.on('EscrowedToFork', async data => {
            if (data.reason.length > REASON_LENGTH_LIMIT) {
               data.reason =
                  data.reason.substring(0, REASON_LENGTH_LIMIT) + '...';
            }

            Logger.info('ready.js: On EscrowedToFork', {
               forkId: data.forkId,
               owner: data.owner.id,
               tokenIds: data.tokenIds,
               reason: data.reason,
            });

            data.owner.name =
               (await Nouns.ensReverseLookup(data.owner.id)) ??
               (await shortenAddress(data.owner.id));

            // Grabbing fork threshold numbers.
            const ESCROW_PROXY = '0x44d97D22B3d37d837cE4b22773aAd9d1566055D9';
            const currentEscrowAmount =
               await Nouns.NounsToken.Contract.getCurrentVotes(ESCROW_PROXY);

            const THRESHOLD_FRACTION = 0.2;
            const totalSupply = await Nouns.NounsToken.Contract.totalSupply();
            const thresholdNumber =
               Math.floor(totalSupply * THRESHOLD_FRACTION) + 1; // Must be strictly greater than thresholdFraction. Hence + 1.

            const currentPercentage = Math.floor(
               (currentEscrowAmount / thresholdNumber) * 100,
            );

            data.currentEscrowAmount = currentEscrowAmount;
            data.totalSupply = totalSupply;
            data.thresholdNumber = thresholdNumber;
            data.currentPercentage = currentPercentage;

            sendToChannelFeeds('escrowedToFork', data, client);
         });

         Nouns.on('ExecuteFork', async data => {
            Logger.info('ready.js: On ExecuteFork', {
               forkId: data.forkId,
               forkTreasury: data.forkTreasury.id,
               forkToken: data.forkToken.id,
               forkEndTimestamp: data.forkEndTimestamp,
               tokensInEscrow: data.tokensInEscrow,
            });

            data.forkTreasury.name =
               (await Nouns.ensReverseLookup(data.forkTreasury.id)) ??
               (await shortenAddress(data.forkTreasury.id));
            data.forkToken.name =
               (await Nouns.ensReverseLookup(data.forkToken.id)) ??
               (await shortenAddress(data.forkToken.id));

            sendToChannelFeeds('executeFork', data, client);
         });

         Nouns.on('JoinFork', async data => {
            Logger.info('ready.js: On JoinFork', {
               forkId: data.forkId,
               owner: data.owner.id,
               numOfTokens: data.tokenIds.length,
               numOfProposalIds: data.proposalIds.length,
               reason: data.reason,
            });

            data.owner.name =
               (await Nouns.ensReverseLookup(data.owner.id)) ??
               (await shortenAddress(data.owner.id));

            sendToChannelFeeds('joinFork', data, client);
         });

         // =============================================================
         // Nouns Fork Tokens
         // =============================================================

         nounsForkToken.on('DelegateChanged', async data => {
            Logger.info('ready.js: On ForkDelegateChanged', {
               delegator: data.delegator.id,
               fromDelegate: data.fromDelegate.id,
               toDelegate: data.toDelegate.id,
            });

            data.delegator.name =
               (await Nouns.ensReverseLookup(data.delegator.id)) ??
               (await shortenAddress(data.delegator.id));
            data.fromDelegate.name =
               (await Nouns.ensReverseLookup(data.fromDelegate.id)) ??
               (await shortenAddress(data.fromDelegate.id));
            data.toDelegate.name =
               (await Nouns.ensReverseLookup(data.toDelegate.id)) ??
               (await shortenAddress(data.toDelegate.id));

            let numOfVotesChanged = 0;
            try {
               // The number of votes being changes is stored in receipt logs index 1 and 2.
               // It is formatted as a single hex, where the first 64 digits after 0x is the previous vote count.
               // And the second 64 digits after 0x is the new vote count of the delegate.
               // To see this in detail, follow the link of the delegate changed event and check the receipt logs.
               const event = data.event;
               const receipt = await event.getTransactionReceipt();
               if (receipt.logs[1]) {
                  const hexData = receipt.logs[1].data;
                  numOfVotesChanged = extractVoteChange(hexData);
               }
            } catch (error) {
               Logger.error(
                  "events/discordEvents/client/ready.js: On ForkDelegateChanged. There's been an error.",
                  {
                     error: error,
                  },
               );
            }
            data.numOfVotesChanged = numOfVotesChanged;

            sendToChannelFeeds('forkDelegateChanged', data, client);
         });

         nounsForkToken.on('Transfer', async data => {
            Logger.info('ready.js: On ForkTransfer', {
               from: data.from.id,
               to: data.to.id,
               tokenId: data.tokenId,
            });

            data.from.name =
               (await Nouns.ensReverseLookup(data.from.id)) ??
               (await shortenAddress(data.from.id));
            data.to.name =
               (await Nouns.ensReverseLookup(data.to.id)) ??
               (await shortenAddress(data.to.id));

            sendToChannelFeeds('transferForkNoun', data, client);
         });

         nounsForkToken.on('NounCreated', async data => {
            Logger.info('ready.js: On ForkNounCreated', {
               id: data.id,
            });

            sendToChannelFeeds('forkNounCreated', data, client);
         });

         // =============================================================
         // Nouns Fork Auction House
         // =============================================================
         nounsForkAuctionHouse.on('AuctionCreated', async auction => {
            Logger.info('events/ready.js: On ForkAuctionCreated.', {
               auctionId: `${auction.id}`,
               auctionStartTime: `${auction.startTime}`,
               auctionEndTime: `${auction.endTime}`,
            });

            sendToChannelFeeds('forkAuctionCreated', auction, client);
         });

         nounsForkAuctionHouse.on('AuctionBid', async data => {
            Logger.info('events/ready.js: On ForkAuctionBid.', {
               nounId: `${data.id}`,
               walletAddress: `${data.bidder.id}`,
               ethereumWeiAmount: `${data.amount}`,
               dataExtended: `${data.extended}`,
            });

            data.bidder.name =
               (await Nouns.ensReverseLookup(data.bidder.id)) ??
               (await shortenAddress(data.bidder.id));

            sendToChannelFeeds('forkAuctionBid', data, client);
         });

         // =============================================================
         // Nouns Fork
         // =============================================================

         nounsFork.on('ProposalCreatedWithRequirements', async data => {
            data.description = data.description.substring(0, 500);

            Logger.info(
               'events/ready.js: On ForkProposalCreatedWithRequirements.',
               {
                  id: `${data.id}`,
                  proposer: `${data.proposer.id}`,
                  startBlock: data.startBlock,
                  endBlock: data.endBlock,
                  quorumVotes: `${data.quorumVotes}`,
                  proposalThreshold: `${data.proposalThreshold}`,
                  description: data.description,
                  targets: `${data.targets}`,
                  values: `${data.values}`,
                  signatures: `${data.signatures}`,
                  calldatas: `${data.calldatas}`,
               },
            );
            const titleEndIndex = data.description.indexOf('\n');
            const title = data.description.substring(1, titleEndIndex).trim(); // Title is formatted as '# Title \n'
            data.proposalTitle = `Proposal ${data.id}: ${title}`;

            sendToChannelFeeds('forkProposalCreated', data, client);
         });

         nounsFork.on('ProposalCanceled', async data => {
            Logger.info('events/ready.js: On ForkProposalCanceled.', {
               id: `${data.id}`,
            });

            data.status = 'Canceled';
            data.proposalTitle = await fetchProposalTitle(data.id);

            sendToChannelFeeds('forkProposalStatusChange', data, client);
         });

         nounsFork.on('ProposalQueued', async data => {
            Logger.info('events/ready.js: On ForkProposalQueued.', {
               id: `${data.id}`,
               eta: `${data.eta}`,
            });

            data.status = 'Queued';
            data.proposalTitle = await fetchProposalTitle(data.id);

            sendToChannelFeeds('forkProposalStatusChange', data, client);
         });

         nounsFork.on('ProposalExecuted', async data => {
            Logger.info('events/ready.js: On ForkProposalExecuted.', {
               id: `${data.id}`,
            });

            data.status = 'Executed';
            data.proposalTitle = await fetchProposalTitle(data.id);

            sendToChannelFeeds('forkProposalStatusChange', data, client);
         });

         nounsFork.on('Quit', async data => {
            Logger.info('events/ready.js: On ForkQuit.', {
               quitter: data.msgSender.id,
               numOfTokens: data.tokenIds.length,
            });

            data.msgSender.name =
               (await Nouns.ensReverseLookup(data.msgSender.id)) ??
               (await shortenAddress(data.msgSender.id));

            sendToChannelFeeds('forkQuit', data, client);
         });

         nounsFork.on('VoteCast', async vote => {
            Logger.info('events/ready.js: On ForkVoteCast.', {
               proposalId: Number(vote.proposalId),
               voterId: vote.voter.id,
               votes: Number(vote.votes),
               supportDetailed: vote.supportDetailed,
               reason: vote.reason,
            });

            if (vote.reason && vote.reason.length > REASON_LENGTH_LIMIT) {
               vote.reason =
                  vote.reason.substring(0, REASON_LENGTH_LIMIT) + '...';
            }

            vote.proposalTitle = await fetchProposalTitle(vote.proposalId);
            vote.voter.name =
               (await Nouns.ensReverseLookup(vote.voter.id)) ??
               (await shortenAddress(vote.voter.id));
            vote.choice = ['AGAINST', 'FOR', 'ABSTAIN'][vote.supportDetailed];

            sendToChannelFeeds('forkVoteCast', vote, client);
         });

         // =============================================================
         // Nouns Fork
         // =============================================================

         propdates.on('PostUpdate', async data => {
            if (data.update.length > REASON_LENGTH_LIMIT) {
               data.update =
                  data.update.substring(0, REASON_LENGTH_LIMIT) + '...';
            }

            Logger.info('events/ready.js: On PostUpdate.', {
               propId: data.propId,
               isCompleted: data.isCompleted,
               update: data.update,
            });

            data.proposalTitle = await fetchProposalTitle(data.propId);
            data.nounsForumType = 'PostUpdate';

            sendToChannelFeeds('postUpdate', data, client);
         });

         // *************************************************************
         //
         // EXAMPLE METADATA
         //
         // *************************************************************

         async function testing(nounId) {
            Logger.info('events/ready.js: Testing noun retrieval.', {
               nounId: `${nounId}`,
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
               nounId: `${nounId}`,
               ownerAddress: `${ownerAddress}`,
               ownerEns: ownerEns ?? 'not found',
               delegateAddress: delegateAddress,
               delegateEns: delegateEns ?? 'not found',
               votingPower: `${votingPower}`,
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
                  nounId: `${nounId}`,
                  bidId: `${bid.id}`,
                  bidAmount: `${bid.amount}`,
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

/**
 * @param {number} proposalId
 * @param {object} data
 * @param {Client} client
 */
async function sendToNounsForum(proposalId, data, client) {
   const forums = await NounsProposalForum.find({
      isDeleted: { $ne: true },
   }).exec();

   forums.forEach(async forum => {
      const channel = await fetchForumChannel(forum, client);
      if (!channel) {
         return;
      }

      const thread = await fetchForumThread(
         `${proposalId}`, // Mongoose only supports string keys.
         forum,
         channel,
         data,
      );
      if (!thread) {
         return;
      }

      client.emit('nounsForumUpdate', thread, data);
   });
}

/**
 * @param {string} slug
 * @param {object} data
 * @param {Client} client
 */
async function sendToCandidateForum(slug, data, client) {
   const forums = await NounsCandidateForum.find({
      isDeleted: { $ne: true },
   }).exec();

   forums.forEach(async forum => {
      const channel = await fetchForumChannel(forum, client);
      if (!channel) {
         return;
      }

      const thread = await fetchCandidateForumThread(
         slug,
         forum,
         channel,
         data,
      );
      if (!thread) {
         return;
      }

      client.emit('nounsCandidateForumUpdate', thread, data);
   });
}

/**
 * @param {string} eventName
 * @param {object} data
 * @param {Client} client
 */
async function sendToChannelFeeds(eventName, data, client) {
   let feeds;
   try {
      feeds = await FeedConfig.findChannels(eventName);
   } catch (error) {
      return Logger.error('Unable to retrieve feed config.', {
         error: error,
      });
   }

   feeds
      .filter(feed => {
         return feed && feed.guildId && feed.channelId;
      })
      .forEach(async feed => {
         try {
            const channel = await client.channels.fetch(feed.channelId);
            if (channel) {
               client.emit(eventName, channel, data);
            }
         } catch (error) {
            Logger.error(
               'events/discordEvents/client/ready.js: Received an error.',
               {
                  error: error,
                  channelId: feed.channelId,
               },
            );

            if (error.code === UNKNOWN_CHANNEL_ERROR_CODE) {
               feed.isDeleted = true;
               feed
                  .save()
                  .then(() => {
                     Logger.debug(
                        "events/discordEvents/client/ready.js: Soft-deleted the non-existant channel's feed config.",
                        {
                           channelId: feed.channelId,
                           guildId: feed.guildId,
                           feedEvent: feed.eventName,
                        },
                     );
                  })
                  .catch(err => {
                     Logger.error(
                        'events/discordEvents/client/ready.js: Unable to soft-delete the feed config.',
                        {
                           error: err,
                        },
                     );
                  });
            }
         }
      });
}

/**
 * @param {string} proposalId
 */
async function fetchProposalTitle(proposalId) {
   let title = `Proposal ${proposalId}`;
   try {
      const newProposalTitle = await Proposal.fetchProposalTitle(proposalId);
      if (newProposalTitle === title) {
         const targetPoll = await Poll.findOne({
            'pollData.title': {
               $regex: new RegExp(`^prop\\s${Number(proposalId)}`, 'i'),
            },
         }).exec();
         title = targetPoll ? targetPoll.pollData.title : title;
      } else {
         title = newProposalTitle;
      }
   } catch (error) {
      Logger.error('Unable to find poll for status change.');
   }
   return title;
}
