const { Collection, Client, Channel, TextChannel } = require('discord.js');

const GuildConfig = require('../../../db/schemas/GuildConfig');
const Logger = require('../../../helpers/logger');
const Router = require('../../../helpers/router');
const {
   extractVoteChange,
} = require('../../../views/embeds/contracts/nouns-token');
const NounsProposalForum = require('../../../db/schemas/NounsProposalForum');
const NounsCandidateForum = require('../../../db/schemas/NounsCandidateForum');
const {
   fetchForumChannel,
   fetchForumThread,
   fetchCandidateForumThread,
} = require('../../../helpers/forum');
const Proposal = require('../../../db/schemas/Proposal');
const LilNounsProposal = require('../../../db/schemas/LilNounsProposal');
const { fetchAddressName } = require('../../../utils/nameCache');

const REASON_LENGTH_LIMIT = 3000;
const MAX_PROPOSAL_TITLE = 96;
const PROPHOUSE_NOUNS_HOUSE_ADDRESS =
   '0x5d75fd351e7b29a4ecad708d1e19d137c71c5404';

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
      const router = new Router(client);

      async function runNouns() {
         const nerman = await _nerman;
         const Nouns = client.libraries.get('Nouns');

         const nounsNymz = new nerman.NounsNymz();
         client.libraries.set('NounsNymz', nounsNymz);

         const federationNounsPool = new nerman.FederationNounsPool(
            Nouns.provider,
         );
         client.libraries.set('FederationNounsPool', federationNounsPool);

         const nounsFork = new nerman.NounsFork(Nouns.provider);
         client.libraries.set('NounsFork', nounsFork);

         const propdates = new nerman.Propdates(Nouns.provider);
         client.libraries.set('Propdates', propdates);

         const lilNouns = new nerman.LilNouns(Nouns.provider);
         client.libraries.set('LilNouns', lilNouns);

         const propHouse = new nerman.PropHouse(Nouns.provider);
         client.libraries.set('PropHouse', propHouse);

         // =============================================================
         // Federation
         // =============================================================

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
            data.bidderName = await fetchAddressName(data.bidder, Nouns);
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

            data.eventName = 'FederationBidPlaced';

            router.sendToFeed(data, 'federationBidPlaced', 'federation');
            router.sendToFeed(data, 'threadFederationBidPlaced');
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
            data.bidderName = await fetchAddressName(data.bidder, Nouns);
            data.proposalTitle = await fetchProposalTitle(data.propId);

            const GOVERNANCE_POOL_VOTING_ADDRESS = `0x6b2645b468A828a12fEA8C7D644445eB808Ec2B1`;
            const voting = await Nouns.NounsDAO.Contract.getReceipt(
               data.propId,
               GOVERNANCE_POOL_VOTING_ADDRESS,
            );
            data.voteNumber = voting.votes;

            data.eventName = 'FederationVoteCast';
            router.sendToFeed(data, 'federationVoteCast', 'federation');
            router.sendToFeed(data, 'threadFederationVoteCast');
            sendToNounsForum(data.propId, data, client);
         });

         // =============================================================
         // Nouns Auction House
         // =============================================================

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

            bidData.bidderName = await fetchAddressName(bidData.address, Nouns);

            bidData.eventName = 'AuctionEnd';
            router.sendToFeed(bidData, 'auctionEnd', 'nouns-auction-house');
         });

         Nouns.on('AuctionCreated', async auction => {
            Logger.info('events/ready.js: On AuctionCreated.', {
               auctionId: `${auction.id}`,
               auctionStartTime: `${auction.startTime}`,
               auctionEndTime: `${auction.endTime}`,
            });

            auction.eventName = 'AuctionCreated';
            router.sendToFeed(auction, 'auctionCreated', 'nouns-auction-house');
         });

         Nouns.on('AuctionBid', async data => {
            Logger.info('events/ready.js: On AuctionBid.', {
               nounId: `${data.id}`,
               walletAddress: `${data.bidder.id}`,
               ethereumWeiAmount: `${data.amount}`,
               dataExtended: `${data.extended}`,
            });

            data.bidder.name = await fetchAddressName(data.bidder.id, Nouns);
            data.eventName = 'AuctionBid';
            router.sendToFeed(data, 'auctionBid', 'nouns-auction-house');
         });

         // =============================================================
         // Nouns Token
         // =============================================================

         Nouns.on('DelegateChanged', async data => {
            Logger.info('ready.js: On DelegateChanged.', {
               delegator: data.delegator.id,
               oldDelegate: data.fromDelegate.id,
               newDelegate: data.toDelegate.id,
               event: data.event,
            });

            data.delegator.name = await fetchAddressName(
               data.delegator.id,
               Nouns,
            );
            data.fromDelegate.name = await fetchAddressName(
               data.fromDelegate.id,
               Nouns,
            );
            data.toDelegate.name = await fetchAddressName(
               data.toDelegate.id,
               Nouns,
            );

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
                  "events/ready.js: On DelegateChanged. There's been an error.",
                  {
                     error: error,
                  },
               );
            }
            data.numOfVotesChanged = numOfVotesChanged;

            data.eventName = 'DelegateChanged';
            if (numOfVotesChanged !== 0) {
               router.sendToFeed(data, 'delegateChangedNoZero', 'nouns-token');
            }
            router.sendToFeed(data, 'delegateChanged', 'nouns-token');
         });

         Nouns.on('Transfer', async data => {
            Logger.info('events/ready.js: On Transfer.', {
               fromId: `${data.from.id}`,
               toId: `${data.to.id}`,
               tokenId: `${data.tokenId}`,
            });

            data.from.name = await fetchAddressName(data.from.id, Nouns);
            data.to.name = await fetchAddressName(data.to.id, Nouns);

            data.eventName = 'Transfer';
            router.sendToFeed(data, 'transferNoun', 'nouns-token');
         });

         Nouns.on('NounCreated', async data => {
            Logger.info('events/ready.js: On NounCreated.', {
               nounId: `${data.id}`,
            });

            data.eventName = 'NounCreated';
            router.sendToFeed(data, 'nounCreated', 'nouns-token');
         });

         // =============================================================
         // NounsNymz
         // =============================================================

         nounsNymz.on('NewPost', async post => {
            Logger.info('ready.js: On NewPost.', {
               postId: post.id,
               postTitle: post.title,
            });

            post.eventName = 'NewPost';
            router.sendToFeed(post, 'newPost', 'nouns-nymz');
         });

         // =============================================================
         // Nouns DAO
         // =============================================================

         Nouns.on('VoteCast', async vote => {
            Logger.info('events/ready.js: On VoteCast.', {
               proposalId: Number(vote.proposalId),
               voterId: vote.voter.id,
               votes: Number(vote.votes),
               supportDetailed: vote.supportDetailed,
               reason: vote.reason,
            });

            vote.proposalTitle = await fetchProposalTitle(vote.proposalId);
            vote.voter.name = await fetchAddressName(vote.voter.id, Nouns);
            vote.choice = ['AGAINST', 'FOR', 'ABSTAIN'][vote.supportDetailed];

            vote.eventName = 'PropVoteCast';

            if (Number(vote.votes) === 0) {
               router.sendToFeed(vote, 'propVoteCastOnlyZero', 'nouns-dao');
            } else {
               router.sendToFeed(vote, 'propVoteCast', 'nouns-dao');
               router.sendToFeed(vote, 'threadVote');
            }

            sendToNounsForum(vote.proposalId, vote, client);
         });

         Nouns.on('ProposalCreatedWithRequirements', async data => {
            data.description = data.description.substring(0, 500);

            try {
               await Proposal.tryCreateProposal(data);
            } catch (error) {
               Logger.error('events/ready.js: Error creating a proposal.', {
                  error: error,
               });
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

            data.proposalTitle = await fetchProposalTitle(data.id);
            data.eventName = 'PropCreated';

            router.sendToFeed(data, 'newProposalPoll');
            router.sendToFeed(data, 'propCreated', 'nouns-dao');
            sendToNounsForum(data.id, data, client);
         });

         Nouns.on('ProposalCanceled', async data => {
            Logger.info('events/ready.js: On ProposalCanceled.', {
               id: `${data.id}`,
            });

            data.status = 'Canceled';
            data.proposalTitle = await fetchProposalTitle(data.id);
            data.eventName = 'PropStatusChange';

            router.sendToFeed(data, 'propStatusChange', 'nouns-dao');
            router.sendToFeed(data, 'threadStatusChange');
            sendToNounsForum(data.id, data, client);
         });

         Nouns.on('ProposalQueued', async data => {
            Logger.info('events/ready.js: On ProposalQueued.', {
               id: `${data.id}`,
               eta: `${data.eta}`,
            });

            data.status = 'Queued';
            data.proposalTitle = await fetchProposalTitle(data.id);
            data.eventName = 'PropStatusChange';

            router.sendToFeed(data, 'propStatusChange', 'nouns-dao');
            router.sendToFeed(data, 'threadStatusChange');
            sendToNounsForum(data.id, data, client);
         });

         Nouns.on('ProposalVetoed', async data => {
            Logger.info('events/ready.js: On ProposalVetoed.', {
               id: `${data.id}`,
            });

            data.status = 'Vetoed';
            data.proposalTitle = await fetchProposalTitle(data.id);
            data.eventName = 'PropStatusChange';

            router.sendToFeed(data, 'propStatusChange', 'nouns-dao');
            router.sendToFeed(data, 'threadStatusChange');
            sendToNounsForum(data.id, data, client);
         });

         Nouns.on('ProposalExecuted', async data => {
            Logger.info('events/ready.js: On ProposalExecuted.', {
               id: `${data.id}`,
            });

            data.status = 'Executed';
            data.proposalTitle = await fetchProposalTitle(data.id);
            data.eventName = 'PropStatusChange';

            router.sendToFeed(data, 'propStatusChange', 'nouns-dao');
            router.sendToFeed(data, 'threadStatusChange');
            sendToNounsForum(data.id, data, client);
         });

         Nouns.on('DAOWithdrawNounsFromEscrow', async data => {
            Logger.info('ready.js: On WithdrawNounsFromEscrow', {
               tokenIds: data.tokenIds,
               to: data.to.id,
            });

            data.to.name = await fetchAddressName(data.to.id, Nouns);

            data.eventName = 'WithdrawNounsFromEscrow';
            router.sendToFeed(data, 'withdrawNounsFromEscrow', 'nouns-dao');
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

            data.owner.name = await fetchAddressName(data.owner.id, Nouns);

            // Grabbing fork threshold numbers.
            const currentEscrowAmount = Number(
               await Nouns.NounsDAO.Contract.numTokensInForkEscrow(),
            );
            const totalSupply =
               await Nouns.NounsDAO.Contract.adjustedTotalSupply();
            const thresholdNumber =
               Number(await Nouns.NounsDAO.Contract.forkThreshold()) + 1; // +1 because it needs to be strictly greater than forkThreshold().

            const currentPercentage = Math.floor(
               (currentEscrowAmount / thresholdNumber) * 100,
            );

            data.currentEscrowAmount = currentEscrowAmount;
            data.totalSupply = totalSupply;
            data.thresholdNumber = thresholdNumber;
            data.currentPercentage = currentPercentage;

            data.eventName = 'EscrowedToFork';
            router.sendToFeed(data, 'escrowedToFork', 'nouns-dao');
         });

         Nouns.on('ExecuteFork', async data => {
            Logger.info('ready.js: On ExecuteFork', {
               forkId: data.forkId,
               forkTreasury: data.forkTreasury.id,
               forkToken: data.forkToken.id,
               forkEndTimestamp: data.forkEndTimestamp,
               tokensInEscrow: data.tokensInEscrow,
            });

            data.forkTreasury.name = await fetchAddressName(
               data.forkTreasury.id,
               Nouns,
            );
            data.forkToken.name = await fetchAddressName(
               data.forkToken.id,
               Nouns,
            );

            data.eventName = 'ExecuteFork';
            router.sendToFeed(data, 'executeFork', 'nouns-dao');
         });

         Nouns.on('JoinFork', async data => {
            Logger.info('ready.js: On JoinFork', {
               forkId: data.forkId,
               owner: data.owner.id,
               numOfTokens: data.tokenIds.length,
               numOfProposalIds: data.proposalIds.length,
               reason: data.reason,
            });

            data.owner.name = await fetchAddressName(data.owner.id, Nouns);

            data.eventName = 'JoinFork';
            router.sendToFeed(data, 'joinFork', 'nouns-dao');
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

            if (!data.slug.trim()) {
               return Logger.warn('ready.js: SignatureAdded. Missing slug.');
            }

            data.msgSender.name = await fetchAddressName(
               data.msgSender.id,
               Nouns,
            );
            data.proposer.name = await fetchAddressName(
               data.proposer.id,
               Nouns,
            );
            data.supportVote = ['AGAINST', 'FOR', 'ABSTAIN'][data.support];
            data.eventName = 'CandidateFeedbackSent';

            router.sendToFeed(data, 'candidateFeedbackSent', 'nouns-dao-data');
            sendToCandidateForum(data.slug, data, client);
         });

         Nouns.on('FeedbackSent', async data => {
            Logger.info('ready.js: On FeedbackSent', {
               msgSender: data.msgSender.id,
               proposalId: data.proposalId,
               support: data.support,
               reason: data.reason,
            });

            data.msgSender.name = await fetchAddressName(
               data.msgSender.id,
               Nouns,
            );
            data.supportVote = ['AGAINST', 'FOR', 'ABSTAIN'][data.support];
            data.proposalTitle = await fetchProposalTitle(data.proposalId);
            data.eventName = 'FeedbackSent';

            router.sendToFeed(data, 'feedbackSent', 'nouns-dao-data');
            router.sendToFeed(data, 'threadFeedbackSent');
            sendToNounsForum(data.proposalId, data, client);
         });

         Nouns.on('ProposalCandidateCanceled', async data => {
            Logger.info('ready.js: On ProposalCandidateCanceled', {
               msgSender: data.msgSender.id,
               slug: data.slug,
               reason: data.reason,
            });

            if (!data.slug.trim()) {
               return Logger.warn('ready.js: SignatureAdded. Missing slug.');
            }

            data.msgSender.name = await fetchAddressName(
               data.msgSender.id,
               Nouns,
            );
            data.proposer = data.msgSender;
            data.eventName = 'ProposalCandidateCanceled';

            router.sendToFeed(
               data,
               'proposalCandidateCanceled',
               'nouns-dao-data',
            );
            sendToCandidateForum(data.slug, data, client);
         });

         Nouns.on('ProposalCandidateCreated', async data => {
            data.description = data.description.substring(0, 500);
            Logger.info('ready.js: On ProposalCandidateCreated.', {
               slug: data.slug,
               proposer: data.msgSender.id,
               description: data.description,
            });

            if (!data.slug.trim()) {
               return Logger.warn('ready.js: SignatureAdded. Missing slug.');
            }

            data.msgSender.name = await fetchAddressName(
               data.msgSender.id,
               Nouns,
            );
            data.proposer = data.msgSender;
            data.eventName = 'ProposalCandidateCreated';

            router.sendToFeed(
               data,
               'proposalCandidateCreated',
               'nouns-dao-data',
            );
            sendToCandidateForum(data.slug, data, client);
         });

         Nouns.on('ProposalCandidateUpdated', async data => {
            Logger.info('ready.js: On ProposalCandidateUpdated', {
               msgSender: data.msgSender.id,
               slug: data.slug,
               reason: data.reason,
            });

            if (!data.slug.trim()) {
               return Logger.warn('ready.js: SignatureAdded. Missing slug.');
            }

            data.msgSender.name = await fetchAddressName(
               data.msgSender.id,
               Nouns,
            );
            data.proposer = data.msgSender;
            data.eventName = 'ProposalCandidateUpdated';

            router.sendToFeed(
               data,
               'proposalCandidateUpdated',
               'nouns-dao-data',
            );
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

            if (!data.slug.trim()) {
               return Logger.warn('ready.js: SignatureAdded. Missing slug.');
            }

            data.proposer.name = await fetchAddressName(
               data.proposer.id,
               Nouns,
            );
            data.signer.name = await fetchAddressName(data.signer.id, Nouns);
            data.votes = await Nouns.NounsToken.Contract.getCurrentVotes(
               data.signer.id,
            );
            data.eventName = 'SignatureAdded';

            router.sendToFeed(data, 'signatureAdded', 'nouns-dao-data');
            sendToCandidateForum(data.slug, data, client);
         });

         // =============================================================
         // Nouns Fork
         // =============================================================

         nounsFork.on('DelegateChanged', async data => {
            Logger.info('ready.js: On ForkDelegateChanged', {
               delegator: data.delegator.id,
               fromDelegate: data.fromDelegate.id,
               toDelegate: data.toDelegate.id,
            });

            data.delegator.name = await fetchAddressName(
               data.delegator.id,
               Nouns,
            );
            data.fromDelegate.name = await fetchAddressName(
               data.fromDelegate.id,
               Nouns,
            );
            data.toDelegate.name = await fetchAddressName(
               data.toDelegate.id,
               Nouns,
            );

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
                  "events/ready.js: On ForkDelegateChanged. There's been an error.",
                  {
                     error: error,
                  },
               );
            }
            data.numOfVotesChanged = numOfVotesChanged;

            data.eventName = 'ForkDelegateChanged';
            router.sendToFeed(data, 'forkDelegateChanged', 'nouns-fork-token');
         });

         nounsFork.on('Transfer', async data => {
            Logger.info('ready.js: On ForkTransfer', {
               from: data.from.id,
               to: data.to.id,
               tokenId: data.tokenId,
            });

            data.from.name = await fetchAddressName(data.from.id, Nouns);
            data.to.name = await fetchAddressName(data.to.id, Nouns);

            data.eventName = 'TransferForkNoun';
            router.sendToFeed(data, 'transferForkNoun', 'nouns-fork-token');
         });

         nounsFork.on('NounCreated', async data => {
            Logger.info('ready.js: On ForkNounCreated', {
               id: data.id,
            });

            data.eventName = 'ForkNounCreated';
            router.sendToFeed(data, 'forkNounCreated', 'nouns-fork-token');
         });

         nounsFork.on('AuctionCreated', async auction => {
            Logger.info('events/ready.js: On ForkAuctionCreated.', {
               auctionId: `${auction.id}`,
               auctionStartTime: `${auction.startTime}`,
               auctionEndTime: `${auction.endTime}`,
            });

            auction.eventName = 'ForkAuctionCreated';
            router.sendToFeed(
               auction,
               'forkAuctionCreated',
               'nouns-fork-auction-house',
            );
         });

         nounsFork.on('AuctionBid', async data => {
            Logger.info('events/ready.js: On ForkAuctionBid.', {
               nounId: `${data.id}`,
               walletAddress: `${data.bidder.id}`,
               ethereumWeiAmount: `${data.amount}`,
               dataExtended: `${data.extended}`,
            });

            data.bidder.name = await fetchAddressName(data.bidder.id, Nouns);

            data.eventName = 'ForkAuctionBid';
            router.sendToFeed(
               data,
               'forkAuctionBid',
               'nouns-fork-auction-house',
            );
         });

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

            data.eventName = 'ForkProposalCreated';
            router.sendToFeed(data, 'forkProposalCreated', 'nouns-fork');
         });

         nounsFork.on('ProposalCanceled', async data => {
            Logger.info('events/ready.js: On ForkProposalCanceled.', {
               id: `${data.id}`,
            });

            data.status = 'Canceled';
            data.proposalTitle = await fetchProposalTitle(data.id);

            data.eventName = 'ForkProposalStatusChange';
            router.sendToFeed(data, 'forkProposalStatusChange', 'nouns-fork');
         });

         nounsFork.on('ProposalQueued', async data => {
            Logger.info('events/ready.js: On ForkProposalQueued.', {
               id: `${data.id}`,
               eta: `${data.eta}`,
            });

            data.status = 'Queued';
            data.proposalTitle = await fetchProposalTitle(data.id);

            data.eventName = 'ForkProposalStatusChange';
            router.sendToFeed(data, 'forkProposalStatusChange', 'nouns-fork');
         });

         nounsFork.on('ProposalExecuted', async data => {
            Logger.info('events/ready.js: On ForkProposalExecuted.', {
               id: `${data.id}`,
            });

            data.status = 'Executed';
            data.proposalTitle = await fetchProposalTitle(data.id);

            data.eventName = 'ForkProposalStatusChange';
            router.sendToFeed(data, 'forkProposalStatusChange', 'nouns-fork');
         });

         nounsFork.on('Quit', async data => {
            Logger.info('events/ready.js: On ForkQuit.', {
               quitter: data.msgSender.id,
               numOfTokens: data.tokenIds.length,
            });

            data.msgSender.name = await fetchAddressName(
               data.msgSender.id,
               Nouns,
            );

            data.eventName = 'ForkQuit';
            router.sendToFeed(data, 'forkQuit', 'nouns-fork');
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
            vote.voter.name = await fetchAddressName(vote.voter.id, Nouns);
            vote.choice = ['AGAINST', 'FOR', 'ABSTAIN'][vote.supportDetailed];

            vote.eventName = 'ForkVoteCast';
            router.sendToFeed(vote, 'forkVoteCast', 'nouns-fork');
         });

         // =============================================================
         // Propdates
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

            data.eventName = 'PostUpdate';
            router.sendToFeed(data, 'postUpdate', 'propdates');
         });

         // =============================================================
         // LilNouns
         // =============================================================

         lilNouns.on('AuctionBid', async data => {
            Logger.info('events/ready.js: On LilNounsAuctionBid.', {
               nounId: `${data.id}`,
               walletAddress: `${data.bidder.id}`,
               ethereumWeiAmount: `${data.amount}`,
            });

            data.bidder.name = await fetchAddressName(data.bidder.id, Nouns);
            data.eventName = 'LilNounsAuctionBid';
            router.sendToFeed(data, 'lilNounsAuctionBid', 'lil-nouns');
         });

         lilNouns.on('AuctionCreated', async data => {
            Logger.info('events/ready.js: On LilNounsAuctionCreated.', {
               auctionId: `${data.id}`,
               auctionStartTime: `${data.startTime}`,
               auctionEndTime: `${data.endTime}`,
            });

            data.eventName = 'LilNounsAuctionCreated';
            router.sendToFeed(data, 'lilNounsAuctionCreated', 'lil-nouns');
         });

         lilNouns.on('ProposalCreatedWithRequirements', async data => {
            data.description = data.description.substring(0, 500);

            try {
               await LilNounsProposal.tryCreateProposal(data);
            } catch (error) {
               Logger.error('events/ready.js: Error creating a proposal.', {
                  error: error,
               });
            }

            Logger.info(
               'events/ready.js: On LilNounsProposalCreatedWithRequirements.',
               {
                  id: `${data.id}`,
                  proposer: `${data.proposer.id}`,
                  description: data.description,
               },
            );

            data.proposalTitle = await LilNounsProposal.fetchProposalTitle(
               data.id,
            );
            data.eventName = 'LilNounsProposalCreated';

            router.sendToFeed(data, 'lilNounsProposalCreated', 'lil-nouns');
            router.sendToFeed(data, 'newLilNounsProposalPoll');
         });

         lilNouns.on('ProposalCanceled', async data => {
            Logger.info('events/ready.js: On LilNounsProposalCanceled.', {
               id: `${data.id}`,
            });

            data.status = 'Canceled';
            data.proposalTitle = await LilNounsProposal.fetchProposalTitle(
               data.id,
            );
            data.eventName = 'LilNounsProposalStatusChange';

            router.sendToFeed(
               data,
               'lilNounsProposalStatusChange',
               'lil-nouns',
            );
         });

         lilNouns.on('ProposalQueued', async data => {
            Logger.info('events/ready.js: On LilNounsProposalQueued.', {
               id: `${data.id}`,
               eta: `${data.eta}`,
            });

            data.status = 'Queued';
            data.proposalTitle = await LilNounsProposal.fetchProposalTitle(
               data.id,
            );
            data.eventName = 'LilNounsProposalStatusChange';

            router.sendToFeed(
               data,
               'lilNounsProposalStatusChange',
               'lil-nouns',
            );
         });

         lilNouns.on('ProposalVetoed', async data => {
            Logger.info('events/ready.js: On LilNounsProposalVetoed.', {
               id: `${data.id}`,
            });

            data.status = 'Vetoed';
            data.proposalTitle = await LilNounsProposal.fetchProposalTitle(
               data.id,
            );
            data.eventName = 'LilNounsProposalStatusChange';

            router.sendToFeed(
               data,
               'lilNounsProposalStatusChange',
               'lil-nouns',
            );
         });

         lilNouns.on('ProposalExecuted', async data => {
            Logger.info('events/ready.js: On LilNounsProposalExecuted.', {
               id: `${data.id}`,
            });

            data.status = 'Executed';
            data.proposalTitle = await LilNounsProposal.fetchProposalTitle(
               data.id,
            );
            data.eventName = 'LilNounsProposalStatusChange';

            router.sendToFeed(
               data,
               'lilNounsProposalStatusChange',
               'lil-nouns',
            );
         });

         lilNouns.on('VoteCast', async vote => {
            Logger.info('events/ready.js: On LilNounsVoteCast.', {
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

            vote.proposalTitle = await LilNounsProposal.fetchProposalTitle(
               vote.proposalId,
            );
            vote.voter.name = await fetchAddressName(vote.voter.id, Nouns);
            vote.choice = ['AGAINST', 'FOR', 'ABSTAIN'][vote.supportDetailed];

            vote.eventName = 'LilNounsVoteCast';
            router.sendToFeed(vote, 'lilNounsVoteCast', 'lil-nouns');
         });

         lilNouns.on('Transfer', async data => {
            Logger.info('events/ready.js: On LilNounsTransfer.', {
               fromId: `${data.from.id}`,
               toId: `${data.to.id}`,
               tokenId: `${data.tokenId}`,
            });

            data.from.name = await fetchAddressName(data.from.id, Nouns);
            data.to.name = await fetchAddressName(data.to.id, Nouns);

            data.eventName = 'LilNounsTransfer';
            router.sendToFeed(data, 'lilNounsTransfer', 'lil-nouns');
         });

         // =============================================================
         // PropHouse
         // =============================================================

         propHouse.on('RoundCreated', async data => {
            Logger.info('events/ready.js: On PropHouse RoundCreated.');

            data.creator.name = await fetchAddressName(data.creator.id, Nouns);

            const house = await propHouse.prophouse.query.getHouse(
               data.house.id,
            );
            data.house = { ...data.house, ...house };

            data.eventName = 'PropHouseRoundCreated';
            router.sendToFeed(data, 'propHouseRoundCreated', 'prop-house');
            if (data.house.id === PROPHOUSE_NOUNS_HOUSE_ADDRESS) {
               router.sendToFeed(
                  data,
                  'propHouseNounsRoundCreated',
                  'prop-house',
               );
            }
         });

         propHouse.on('HouseCreated', async data => {
            Logger.info('events/ready.js: On PropHouse HouseCreated.');

            data.creator.name = await fetchAddressName(data.creator.id, Nouns);

            data.eventName = 'PropHouseHouseCreated';
            router.sendToFeed(data, 'propHouseHouseCreated', 'prop-house');
         });

         propHouse.on('VoteCast', async data => {
            Logger.info('events/ready.js: On PropHouse VoteCast.');

            data.voter.name = await fetchAddressName(data.voter.id, Nouns);

            data.proposal = await propHouse.prophouse.query.getProposal(
               data.round.id,
               data.proposalId,
            );
            const round = await propHouse.prophouse.query.getRoundWithHouseInfo(
               data.round.id,
            );
            data.round = { ...data.round, ...round };
            data.house = round.house;
            data.house.id = round.house.address;

            data.eventName = 'PropHouseVoteCast';
            router.sendToFeed(data, 'propHouseVoteCast', 'prop-house');
            if (data.house.id === PROPHOUSE_NOUNS_HOUSE_ADDRESS) {
               router.sendToFeed(data, 'propHouseNounsVoteCast', 'prop-house');
            }
         });

         propHouse.on('ProposalSubmitted', async data => {
            Logger.info('events/ready.js: On PropHouse ProposalSubmitted.');

            data.proposer.name = await fetchAddressName(
               data.proposer.id,
               Nouns,
            );

            const round = await propHouse.prophouse.query.getRoundWithHouseInfo(
               data.round.id,
            );
            data.round = { ...data.round, ...round };
            data.house = round.house;
            data.house.id = round.house.address;

            data.eventName = 'PropHouseProposalSubmitted';
            router.sendToFeed(data, 'propHouseProposalSubmitted', 'prop-house');
            if (data.house.id === PROPHOUSE_NOUNS_HOUSE_ADDRESS) {
               router.sendToFeed(
                  data,
                  'propHouseNounsProposalSubmitted',
                  'prop-house',
               );
            }
         });
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
 * @param {string} proposalId
 */
async function fetchProposalTitle(proposalId) {
   let title = `Proposal ${proposalId}`;
   try {
      const proposalTitle = await Proposal.fetchProposalTitle(proposalId);
      title = proposalTitle;
   } catch (error) {
      Logger.error('Unable to find poll title.', {
         proposalId: proposalId,
      });
   }

   if (title.length >= MAX_PROPOSAL_TITLE) {
      title = title.substring(0, MAX_PROPOSAL_TITLE).trim() + '...';
   }

   return title;
}
