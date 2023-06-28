const { Collection, Client } = require('discord.js');

const GuildConfig = require('../../../db/schemas/GuildConfig');
const FeedConfig = require('../../../db/schemas/FeedConfig');
const Logger = require('../../../helpers/logger');

module.exports = {
   name: 'ready',
   once: true,
   /**
    *
    * @param {Client} client
    */
   async execute(client) {
      Logger.info(
         `events/ready.js: Ready! Logged in as ${client.user.tag} in ${process.env.NODE_ENV} mode.`,
      );

      await require('../../../db/index.js')(client);
      await require('../../../utils/remindSheet.js')(client);

      // const _StateOfNouns = import('stateofnouns');
      const _nerman = import('nerman');

      async function runNouns() {
         const nerman = await _nerman;
         const Nouns = new nerman.Nouns(process.env.JSON_RPC_API_URL);
         const nounsNymz = new nerman.NounsNymz();

         const {
            guilds: { cache: guildCache },
         } = client;

         // *************************************************************
         //
         // EXAMPLE EVENTS
         //
         // *************************************************************

         Nouns.on('DelegateChanged', async data => {
            Logger.info('ready.js: On DelegateChanged.', {
               delegator: data.delegator.id,
               oldDelegate: data.fromDelegate.id,
               newDelegate: data.toDelegate.id,
               event: data.event,
            });

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

            if (Number(vote.votes) === 0) {
               Logger.info('On VoteCast. Received 0 votes. Exiting.');
               return;
            }

            sendToChannelFeeds('propVoteCast', vote, client);
         });

         Nouns.on('ProposalCreatedWithRequirements', async data => {
            data.description = data.description.substring(0, 150);

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

            sendToChannelFeeds('newProposalPoll', data, client);
            sendToChannelFeeds('propCreated', data, client);
         });

         Nouns.on('ProposalCanceled', async data => {
            Logger.info('events/ready.js: On ProposalCanceled.', {
               id: `${data.id}`,
            });

            data.status = 'Canceled';

            sendToChannelFeeds('propStatusChange', data, client);
         });

         // Nouns.on('ProposalQueued', (data: nerman.EventData.ProposalQueued) => {
         Nouns.on('ProposalQueued', async data => {
            Logger.info('events/ready.js: On ProposalQueued.', {
               id: `${data.id}`,
               eta: `${data.eta}`,
            });

            data.status = 'Queued';

            sendToChannelFeeds('propStatusChange', data, client);
         });

         // Nouns.on('ProposalVetoed', (data: nerman.EventData.ProposalVetoed) => {
         Nouns.on('ProposalVetoed', async data => {
            Logger.info('events/ready.js: On ProposalVetoed.', {
               id: `${data.id}`,
            });

            data.status = 'Vetoed';

            sendToChannelFeeds('propStatusChange', data, client);
         });

         // Nouns.on(
         //    'ProposalExecuted',
         //    (data: nerman.EventData.ProposalExecuted) => {
         Nouns.on('ProposalExecuted', async data => {
            Logger.info('events/ready.js: On ProposalExecuted.', {
               id: `${data.id}`,
            });

            data.status = 'Executed';

            sendToChannelFeeds('propStatusChange', data, client);
         });

         Nouns.on('Transfer', async data => {
            Logger.info('events/ready.js: On Transfer.', {
               fromId: `${data.from.id}`,
               toId: `${data.to.id}`,
               tokenId: `${data.tokenId}`,
            });

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
 *
 * @param {string} eventName
 * @param {object} data
 * @param {Client} client
 * @returns
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

   const channels = await Promise.all(
      feeds
         .filter(feed => {
            return feed && feed.guildId && feed.channelId;
         })
         .map(feed => {
            return client.channels.fetch(feed.channelId);
         }),
   );

   channels.forEach(channel => {
      if (channel) {
         client.emit(eventName, channel, data);
      }
   });
}
