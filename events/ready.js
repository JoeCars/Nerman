const { Collection } = require('discord.js');

const PollChannel = require('../db/schemas/PollChannel');
const GuildConfig = require('../db/schemas/GuildConfig');
const Logger = require('../helpers/logger');
const {
   createProposalStatusEmbed,
   createInitialVoteEmbed,
   createNewProposalEmbed,
} = require('../helpers/proposalHelpers');

const { Types } = require('mongoose');

module.exports = {
   name: 'ready',
   once: true,
   async execute(client) {
      Logger.info(
         `events/ready.js: Ready! Logged in as ${client.user.tag} in ${process.env.NODE_ENV} mode.`,
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
               proposalId: Number(vote.proposalId),
               voterId: vote.voter.id,
               votes: Number(vote.votes),
               supportDetailed: vote.supportDetailed,
               reason: vote.reason,
            });

            const nounsGovId = process.env.NOUNS_GOV_ID;

            // todo we have to come back later and change this when we make the actual configs so we don't need to rely on this sort of messy logic
            // todo also make sure to change this back to 'production' before pushing
            // if (process.env.DEPLOY_STAGE === 'development') {
            if (process.env.DEPLOY_STAGE === 'production') {
               try {
                  const ncdGuildId = process.env.NCD_GUILD_ID;
                  const ncdChannelId = process.env.NCD_CHANNEL_ID;

                  const agoraGuildId = process.env.AGORA_GUILD_ID;
                  const agoraChannelId = process.env.AGORA_CHANNEL_ID;

                  // Nouncil
                  const nounsGovChannel = guildCache
                     .get(process.env.DISCORD_GUILD_ID)
                     .channels.cache.get(nounsGovId);

                  // Nouns Community Discord
                  const ncdChannel = guildCache
                     .get(ncdGuildId)
                     .channels.cache.get(ncdChannelId);

                  // Agora
                  const agoraChannel = guildCache
                     .get(agoraGuildId)
                     .channels.cache.get(agoraChannelId);

                  Logger.info(
                     'events/ready.js: On VoteCast. DEPLOY_STAGE = "production"',
                     {
                        nounsGuildId:
                           process.env.DISCORD_GUILD_ID ?? 'Not Found',
                        nounsChannelId: nounsGovId ?? 'Not Found',
                        ncdGuildId: ncdGuildId ?? 'Not Found',
                        ncdChannelId: ncdChannelId ?? 'Not Found',
                        agoraGuildId: agoraGuildId ?? 'Not Found',
                        agoraChannelId: agoraChannelId ?? 'Not Found',
                     },
                  );

                  const channelList = [
                     nounsGovChannel,
                     ncdChannel,
                     agoraChannel,
                  ];

                  const promises = channelList.map(async channel => {
                     const voteEmbed = await createInitialVoteEmbed(
                        vote,
                        Nouns,
                     );
                     let message = await channel.send({
                        content: null,
                        embeds: [voteEmbed],
                     });

                     return message;
                  });

                  const resolved = await Promise.all(promises);

                  resolved.forEach(message => {
                     client.emit('propVoteCast', message, vote);
                  });
               } catch (error) {
                  Logger.error(
                     'events/ready.js: On VoteCast. Encountered an error',
                     { error },
                  );
               }
            } else {
               const nounsGovChannel = guildCache
                  .get(process.env.DISCORD_GUILD_ID)
                  .channels.cache.get(nounsGovId);

               const voteEmbed = await createInitialVoteEmbed(vote, Nouns);

               let message = await nounsGovChannel.send({
                  content: null,
                  embeds: [voteEmbed],
               });

               client.emit('propVoteCast', message, vote);
            }
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

            const nounsGovId = process.env.NOUNS_GOV_ID;

            // todo fix these silly ternaries, I hate them, they're no longer needed
            const propChannelId =
               process.env.DEPLOY_STAGE === 'development'
                  ? process.env.DEVNERMAN_NOUNCIL_CHAN_ID
                  : process.env.TESTNERMAN_NOUNCIL_CHAN_ID;

            const propChannel = await guildCache
               .get(process.env.DISCORD_GUILD_ID)
               .channels.cache.get(propChannelId);

            const { id: propId, description: desc } = data;

            const titleRegex = new RegExp(/^(\#\s(?:\S+\s?)+(?:\S+\n?))/);

            const title = desc
               .match(titleRegex)[0]
               .replaceAll(/^(#\s)|(\n+)$/g, '');
            // const description = `https://nouns.wtf/vote/${propId}`;
            let description;

            // todo switch this to production when finished testing
            // if (process.env.DEPLOY_STAGE === 'development') {
            if (process.env.DEPLOY_STAGE === 'production') {
               // Nouncil
               const nounsGovChannel = guildCache
                  .get(process.env.DISCORD_GUILD_ID)
                  .channels.cache.get(nounsGovId);

               // NCD
               const ncdGuildId = process.env.NCD_GUILD_ID;
               const ncdChannelId = process.env.NCD_CHANNEL_ID;
               const ncdChannel = guildCache
                  .get(ncdGuildId)
                  .channels.cache.get(ncdChannelId);

               // Agora
               const agoraGuildId = process.env.AGORA_GUILD_ID;
               const agoraChannelId = process.env.AGORA_CHANNEL_ID;
               const agoraChannel = guildCache
                  .get(agoraGuildId)
                  .channels.cache.get(agoraChannelId);

               // List of channels to output events to, can't wait for config
               const channelList = [nounsGovChannel, ncdChannel, agoraChannel];

               const configExists = !!(await PollChannel.countDocuments({
                  channelId: propChannelId,
               }).exec());

               if (!configExists) {
                  Logger.warn(
                     'events/ready.js: On ProposalCreatedWithRequirements. No config. Aborting output of Proposal Poll.',
                     {
                        id: `${data.id}`,
                        proposer: `${data.proposer.id}`,
                     },
                  );
                  // return;
               } else {
                  let message = await propChannel.send({
                     content: null,
                     embeds: [createNewProposalEmbed(data)],
                  });

                  client.emit('newProposal', message, data);
               }

               const promises = channelList.map(async channel => {
                  let message = await channel.send({
                     content: null,
                     embeds: [createNewProposalEmbed(data)],
                  });

                  return message;
               });

               const resolved = await Promise.all(promises);

               resolved.forEach(message => {
                  client.emit('propCreated', message, data);
               });
            } else {
               const configExists = !!(await PollChannel.countDocuments({
                  channelId: propChannelId,
               }).exec());

               if (!configExists) {
                  Logger.warn(
                     'events/ready.js: On ProposalCreatedWithRequirements. Aborting output of Proposal Poll.',
                     {
                        id: `${data.id}`,
                        proposer: `${data.proposer.id}`,
                     },
                  );
                  return;
               }

               // const { id: propId, description: desc } = data;

               // todo finetune thew regexp to extract title from any possible markdown
               // const titleRegex = new RegExp(
               //    /^(\#\s((\w|[0-9_\-+=.,!:`~%;_&$()*\/\[\]\{\}@\\\|])+\s+)+(\w+\s?\n?))/
               // );

               // const titleRegex = new RegExp(/^\N+/);
               // const titleRegex = new RegExp(/^(\#\s(?:\S+\s?)+(?:\S+\n?))/);

               // const title = desc
               //    .match(titleRegex)[0]
               //    .replaceAll(/^(#\s)|(\n+)$/g, '');
               // const description = `https://nouns.wtf/vote/${propId}`;

               let message = await propChannel.send({
                  content: null,
                  embeds: [createNewProposalEmbed(data)],
               });

               // todo I should rename these events to be less confusing
               client.emit('newProposal', message, data);
               // client.emit('propCreated', message, data);
            }
         });

         Nouns.on('ProposalCanceled', async data => {
            Logger.info('events/ready.js: On ProposalCanceled.', {
               id: `${data.id}`,
            });

            const nounsGovId = process.env.NOUNS_GOV_ID;

            const nounsGovChannel = guildCache
               .get(process.env.DISCORD_GUILD_ID)
               .channels.cache.get(nounsGovId);

            const status = 'Canceled';

            // todo change to production after testing
            // if (process.env.DEPLOY_STAGE === 'development') {
            if (process.env.DEPLOY_STAGE === 'production') {
               try {
                  // NCD
                  const ncdGuildId = process.env.NCD_GUILD_ID;
                  const ncdChannelId = process.env.NCD_CHANNEL_ID;
                  const ncdChannel = guildCache
                     .get(ncdGuildId)
                     .channels.cache.get(ncdChannelId);

                  // Agora
                  const agoraGuildId = process.env.AGORA_GUILD_ID;
                  const agoraChannelId = process.env.AGORA_CHANNEL_ID;
                  const agoraChannel = guildCache
                     .get(agoraGuildId)
                     .channels.cache.get(agoraChannelId);

                  // List of channels to output events to, can't wait for config
                  const channelList = [
                     nounsGovChannel,
                     ncdChannel,
                     agoraChannel,
                  ];

                  const promises = channelList.map(async channel => {
                     const statusEmbed = await createProposalStatusEmbed(
                        data,
                        status,
                     );

                     let message = await channel.send({
                        content: null,
                        embeds: [statusEmbed],
                     });

                     return message;
                  });

                  const resolved = await Promise.all(promises);

                  resolved.forEach(message => {
                     client.emit('propStatusChange', message, status, data);
                  });
               } catch (error) {
                  Logger.error(
                     'events/ready.js: ProposalCanceled - an error has occurred',
                     { error },
                  );
               }
            } else {
               const statusEmbed = await createProposalStatusEmbed(
                  data,
                  status,
               );

               let message = await nounsGovChannel.send({
                  content: null,
                  embeds: [statusEmbed],
               });

               client.emit('propStatusChange', message, status, data);
            }
         });

         // Nouns.on('ProposalQueued', (data: nerman.EventData.ProposalQueued) => {
         Nouns.on('ProposalQueued', async data => {
            Logger.info('events/ready.js: On ProposalQueued.', {
               id: `${data.id}`,
               eta: `${data.eta}`,
            });

            const nounsGovId = process.env.NOUNS_GOV_ID;

            const nounsGovChannel = guildCache
               .get(process.env.DISCORD_GUILD_ID)
               .channels.cache.get(nounsGovId);

            const status = 'Queued';

            // todo change to production after testing
            // if (process.env.DEPLOY_STAGE === 'development') {
            if (process.env.DEPLOY_STAGE === 'production') {
               try {
                  // NCD
                  const ncdGuildId = process.env.NCD_GUILD_ID;
                  const ncdChannelId = process.env.NCD_CHANNEL_ID;
                  const ncdChannel = guildCache
                     .get(ncdGuildId)
                     .channels.cache.get(ncdChannelId);

                  // Agora
                  const agoraGuildId = process.env.AGORA_GUILD_ID;
                  const agoraChannelId = process.env.AGORA_CHANNEL_ID;
                  const agoraChannel = guildCache
                     .get(agoraGuildId)
                     .channels.cache.get(agoraChannelId);

                  // List of channels to output events to, can't wait for config
                  const channelList = [
                     nounsGovChannel,
                     ncdChannel,
                     agoraChannel,
                  ];

                  const promises = channelList.map(async channel => {
                     const statusEmbed = await createProposalStatusEmbed(
                        data,
                        status,
                     );

                     let message = await channel.send({
                        content: null,
                        embeds: [statusEmbed],
                     });

                     return message;
                  });

                  const resolved = await Promise.all(promises);

                  resolved.forEach(message => {
                     client.emit('propStatusChange', message, status, data);
                  });
               } catch (error) {
                  Logger.error(
                     'events/ready.js: ProposalQueued - an error has occurred',
                     { error },
                  );
               }
            } else {
               const statusEmbed = await createProposalStatusEmbed(
                  data,
                  status,
               );

               let message = await nounsGovChannel.send({
                  content: null,
                  embeds: [statusEmbed],
               });

               client.emit('propStatusChange', message, status, data);
            }
         });

         // Nouns.on('ProposalVetoed', (data: nerman.EventData.ProposalVetoed) => {
         Nouns.on('ProposalVetoed', async data => {
            Logger.info('events/ready.js: On ProposalVetoed.', {
               id: `${data.id}`,
            });

            const nounsGovId = process.env.NOUNS_GOV_ID;

            const nounsGovChannel = guildCache
               .get(process.env.DISCORD_GUILD_ID)
               .channels.cache.get(nounsGovId);

            const status = 'Vetoed';

            // todo change to production after testing
            // if (process.env.DEPLOY_STAGE === 'development') {
            if (process.env.DEPLOY_STAGE === 'production') {
               try {
                  // NCD
                  const ncdGuildId = process.env.NCD_GUILD_ID;
                  const ncdChannelId = process.env.NCD_CHANNEL_ID;
                  const ncdChannel = guildCache
                     .get(ncdGuildId)
                     .channels.cache.get(ncdChannelId);

                  // Agora
                  const agoraGuildId = process.env.AGORA_GUILD_ID;
                  const agoraChannelId = process.env.AGORA_CHANNEL_ID;
                  const agoraChannel = guildCache
                     .get(agoraGuildId)
                     .channels.cache.get(agoraChannelId);

                  // List of channels to output events to, can't wait for config
                  const channelList = [
                     nounsGovChannel,
                     ncdChannel,
                     agoraChannel,
                  ];

                  const promises = channelList.map(async channel => {
                     const statusEmbed = await createProposalStatusEmbed(
                        data,
                        status,
                     );

                     let message = await channel.send({
                        content: null,
                        embeds: [statusEmbed],
                     });

                     return message;
                  });

                  const resolved = await Promise.all(promises);

                  resolved.forEach(message => {
                     client.emit('propStatusChange', message, status, data);
                  });
               } catch (error) {
                  Logger.error(
                     'events/ready.js: ProposalVetoed - an error has occurred',
                     { error },
                  );
               }
            } else {
               const statusEmbed = await createProposalStatusEmbed(
                  data,
                  status,
               );

               let message = await nounsGovChannel.send({
                  content: null,
                  embeds: [statusEmbed],
               });

               client.emit('propStatusChange', message, status, data);
            }
         });

         // Nouns.on(
         //    'ProposalExecuted',
         //    (data: nerman.EventData.ProposalExecuted) => {
         Nouns.on('ProposalExecuted', async data => {
            Logger.info('events/ready.js: On ProposalExecuted.', {
               id: `${data.id}`,
            });

            const nounsGovId = process.env.NOUNS_GOV_ID;

            const nounsGovChannel = guildCache
               .get(process.env.DISCORD_GUILD_ID)
               .channels.cache.get(nounsGovId);

            const status = 'Executed';

            // todo change to production after testing
            // if (process.env.DEPLOY_STAGE === 'development') {
            if (process.env.DEPLOY_STAGE === 'production') {
               try {
                  // NCD
                  const ncdGuildId = process.env.NCD_GUILD_ID;
                  const ncdChannelId = process.env.NCD_CHANNEL_ID;
                  const ncdChannel = guildCache
                     .get(ncdGuildId)
                     .channels.cache.get(ncdChannelId);

                  // Agora
                  const agoraGuildId = process.env.AGORA_GUILD_ID;
                  const agoraChannelId = process.env.AGORA_CHANNEL_ID;
                  const agoraChannel = guildCache
                     .get(agoraGuildId)
                     .channels.cache.get(agoraChannelId);

                  // List of channels to output events to, can't wait for config
                  const channelList = [
                     nounsGovChannel,
                     ncdChannel,
                     agoraChannel,
                  ];

                  const promises = channelList.map(async channel => {
                     const statusEmbed = await createProposalStatusEmbed(
                        data,
                        status,
                     );

                     let message = await channel.send({
                        content: null,
                        embeds: [statusEmbed],
                     });

                     return message;
                  });

                  const resolved = await Promise.all(promises);

                  resolved.forEach(message => {
                     client.emit('propStatusChange', message, status, data);
                  });
               } catch (error) {
                  Logger.error(
                     'events/ready.js: ProposalExecuted - an error has occurred',
                     { error },
                  );
               }
            } else {
               const statusEmbed = await createProposalStatusEmbed(
                  data,
                  status,
               );

               let message = await nounsGovChannel.send({
                  content: null,
                  embeds: [statusEmbed],
               });

               client.emit('propStatusChange', message, status, data);
            }
         });

         Nouns.on('Transfer', async data => {
            Logger.info('events/ready.js: On Transfer.', {
               fromId: `${data.from.id}`,
               toId: `${data.to.id}`,
               tokenId: `${data.tokenId}`,
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
               auctionId: `${auction.id}`,
               auctionStartTime: `${auction.startTime}`,
               auctionEndTime: `${auction.endTime}`,
            });

            const guildId = process.env.DISCORD_GUILD_ID;
            const genId = process.env.NOUNCIL_GENERAL;
            const genChannel = await guildCache
               .get(guildId)
               .channels.cache.get(genId);

            client.emit('auctionCreated', genChannel, auction);
         });

         Nouns.on('NounCreated', async data => {
            // console.log(
            //    'NounsToken | NounCreated | id:' +
            //       data.id +
            //       ', seed: ' +
            //       JSON.stringify(data.seed),
            // );

            Logger.info('events/ready.js: On NounCreated.', {
               nounId: `${data.id}`,
            });

            const nogGuildId = process.env.NOGGLES_DISCORD_ID;
            const nogChanId = process.env.NOGGLES_CHANNEL_ID;
            const nogglesChannel = await guildCache
               .get(nogGuildId)
               .channels.cache.get(nogChanId);

            // todo switch to production
            // if (process.env.DEPLOY_STAGE === 'development') {
            if (process.env.DEPLOY_STAGE === 'production') {
               try {
                  const ncdGuildId = process.env.NCD_GUILD_ID;
                  const ncdChannelId = process.env.NCD_CHANNEL_ID;
                  const ncdChannel = guildCache
                     .get(ncdGuildId)
                     .channels.cache.get(ncdChannelId);

                  const channelList = [nogglesChannel, ncdChannel];

                  channelList.forEach(channel => {
                     client.emit('nounCreated', channel, data);
                  });
               } catch (error) {
                  Logger.error(
                     'events/ready.js: nounCreated - Encountered an erro!',
                     { error },
                  );
               }
            } else {
               client.emit('nounCreated', nogglesChannel, data);
            }
         });

         Nouns.on('AuctionBid', async data => {
            Logger.info('events/ready.js: On AuctionBid.', {
               nounId: `${data.id}`,
               walletAddress: `${data.bidder.id}`,
               ethereumWeiAmount: `${data.amount}`,
               dataExtended: `${data.extended}`,
            });

            const guildId = process.env.DISCORD_GUILD_ID;
            // const nounsTokenId = process.env.NOUNS_TOKEN_ID;
            const nounsAuctionId = process.env.NOUNS_AUCTION_ID;
            const nounsAuctionChannel = await guildCache
               .get(guildId)
               .channels.cache.get(nounsAuctionId);

            // todo change to production after testing
            // if (process.env.DEPLOY_STAGE === 'development') {
            if (process.env.DEPLOY_STAGE === 'production') {
               try {
                  // NCD
                  const ncdGuildId = process.env.NCD_GUILD_ID;
                  const ncdChannelId = process.env.NCD_CHANNEL_ID;
                  const ncdChannel = guildCache
                     .get(ncdGuildId)
                     .channels.cache.get(ncdChannelId);

                  // List of channels to output events to, can't wait for config
                  const channelList = [nounsAuctionChannel, ncdChannel];

                  channelList.forEach(channel => {
                     channel.client.emit('auctionBid', channel, data);
                  });
               } catch (error) {
                  Logger.error(
                     'events/ready.js: ProposalExecuted - an error has occurred',
                     { error },
                  );
               }
            } else {
               client.emit('auctionBid', nounsAuctionChannel, data);
            }
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
