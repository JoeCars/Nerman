const { Collection, Client, Channel, TextChannel } = require('discord.js');

const GuildConfig = require('../../../db/schemas/GuildConfig');
const FeedConfig = require('../../../db/schemas/FeedConfig');
const Poll = require('../../../db/schemas/Poll');
const Logger = require('../../../helpers/logger');
const { extractVoteChange } = require('../../../views/embeds/delegateChanged');
const shortenAddress = require('../../../helpers/nouns/shortenAddress');
const NounsProposalForum = require('../../../db/schemas/NounsProposalForum');
const {
   fetchForumChannel,
   fetchForumThread,
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
      await require('../../../utils/remindSheet.js')(client);

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
            const voting = await Nouns.NounsDAO.Contract.getReceipt(
               data.propId,
               GOVERNANCE_POOL_VOTING_ADDRESS,
            );
            data.voteNumber = voting[2];

            sendToChannelFeeds('federationBidPlaced', data, client);
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
            data.voteNumber = voting[2];
            data.nounsForumType = 'VoteCast';

            sendToChannelFeeds('federationVoteCast', data, client);
            sendToNounsForum(data.propId, data, client);
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

            if (Number(vote.votes) === 0) {
               Logger.info('On VoteCast. Received 0 votes. Exiting.');
               return;
            }

            vote.proposalTitle = await fetchProposalTitle(vote.proposalId);
            vote.voter.name =
               (await Nouns.ensReverseLookup(vote.voter.id)) ??
               (await shortenAddress(vote.voter.id));
            vote.choice = ['AGAINST', 'FOR', 'ABSTAIN'][vote.supportDetailed];
            vote.nounsForumType = 'PropVoteCast';

            sendToChannelFeeds('propVoteCast', vote, client);
            sendToChannelFeeds('threadVote', vote, client);

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
            data.title = await fetchProposalTitle(data.id);
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
            data.title = await fetchProposalTitle(data.id);
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
            data.title = await fetchProposalTitle(data.id);
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
            data.title = await fetchProposalTitle(data.id);
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
