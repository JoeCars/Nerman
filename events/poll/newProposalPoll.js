// todo I should rename newProposal to reduce confusion maybe? Will workshop it
const { MessageEmbed, TextChannel } = require('discord.js');
const { Types } = require('mongoose');

const { initPollMessage } = require('../../helpers/poll/initPollMessage');
const PollChannel = require('../../db/schemas/PollChannel');
const PollCount = require('../../db/schemas/ChannelPollCount');
const Poll = require('../../db/schemas/Poll');
const User = require('../../db/schemas/User');
const UrlConfig = require('../../db/schemas/UrlConfig');
const Logger = require('../../helpers/logger');
const { createNewProposalEmbed } = require('../../helpers/proposalHelpers');

module.exports = {
   name: 'newProposalPoll',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, proposal) {
      const initialConfigExists = !!(await PollChannel.countDocuments({
         channelId: channel.id,
      }).exec());

      if (!initialConfigExists) {
         return Logger.warn(
            'events/customEvents/poll/newPollProposal.js: No config. Aborting output of Proposal Poll.',
            {
               id: `${proposal.id}`,
               proposer: `${proposal.proposer.id}`,
            },
         );
      }

      const { propUrl } = await UrlConfig.fetchUrls(channel.guildId);

      const interaction = await channel.send({
         content: null,
         embeds: [createNewProposalEmbed(proposal, propUrl)],
      });

      const {
         client,
         guildId,
         guild: {
            channels: { cache },
            roles: {
               everyone: { id: everyoneId },
            },
         },
         member: {
            nickname,
            user,
            user: { username, discriminator },
         },
         // } = interaction;
      } = interaction;

      Logger.info('events/poll/newProposalPoll.js: Creating new proposal.', {
         guildId: guildId,
         member: username,
      });

      const configExists = await PollChannel.configExists(channel.id);
      Logger.debug('events/poll/newProposalPoll.js: Checking config exists.', {
         configExists: configExists,
         guildId: guildId,
         member: username,
      });
      if (!configExists) {
         Logger.info(
            'events/poll/newProposalPoll.js: No config exists. Exiting.',
            {
               guildId: guildId,
               member: username,
            },
         );
         return;
      }

      const { id: propId, description: desc } = proposal;

      const title = `Prop ${propId}: ${desc
         .match(new RegExp(/^#+\s+.+\n/))[0]
         .replaceAll(/^(#\s)|(\n+)$/g, '')}`;
      const description = propUrl + propId;

      Logger.debug('events/poll/newProposalPoll.js: Checking proposal.', {
         guildId: guildId,
         member: username,
         title: title,
         propId: propId,
      });

      const channelConfig = await PollChannel.findOne(
         {
            channelId: channel.id,
         },
         '_id allowedRoles quorum duration forAgainst',
      ).exec();

      Logger.debug('events/poll/newProposalPoll.js: Checking roles and IDs.', {
         guildId: guildId,
         member: username,
         everyoneId: everyoneId,
         allowedRoles: channelConfig.allowedRoles,
      });

      const messageObject = await initPollMessage({
         propId,
         title,
         description,
         channelConfig,
         everyoneId,
      });

      const pollData = {
         title,
         description,
         voteAllowance: 1,
         choices: channelConfig.forAgainst ? ['for', 'against'] : ['yes', 'no'],
      };

      const snapshotMap = new Map();

      // todo try to implement env for the allowed roles so that we can do this dynamically when hosting and using in other servers
      // todo also this should be done via fetching the config
      let allowedUsers;
      try {
         allowedUsers = await interaction.guild.members
            .fetch({
               withPresences: true,
            })
            .then(fetchedMembers => {
               return fetchedMembers.filter(member => {
                  return (
                     //    member.presence?.status === 'online' && //disabled not worrying about the online presence
                     !member.user.bot &&
                     member?.roles.cache.hasAny(...channelConfig.allowedRoles)
                  );
               });
            });

         for (const key of allowedUsers.keys()) {
            snapshotMap.set(key, false);
         }
      } catch (error) {
         Logger.error('events/poll/newProposalPoll.js: Error.', {
            error: error,
         });
      }

      const countExists = await PollCount.checkExists(channel.id);

      Logger.debug('events/poll/newProposalPoll.js: Checking existing count.', {
         guildId: guildId,
         member: username,
         countExists: countExists,
      });

      let pollNumber;

      if (!countExists) {
         pollNumber = await PollCount.createCount(channel.id);
      } else {
         pollNumber = await PollCount.findOne({
            channelId: channel.id,
         }).exec();
      }

      try {
         // todo refactor this to use {new: true} and return the document perhaps, rather than this two part operation?
         Logger.debug(
            'events/poll/newProposalPoll.js: Checking poll attributes.',
            {
               guildId: guildId,
               userId: user.id,
               channelConfigId: channelConfig._id,
               interactionId: interaction.id,
               pollData: pollData,
            },
         );

         const data = {
            _id: new Types.ObjectId(),
            guildId,
            creatorId: user.id,
            // messageId: message.id,
            messageId: interaction.id,
            // config: config._id,
            config: channelConfig._id,
            pollData,
            votes: undefined,
            abstains: undefined,
            allowedUsers: snapshotMap,
            status: 'open',
         };

         const newPoll = await (
            await Poll.createNewPoll(data, channelConfig.durationMs)
         )
            .populate('config')
            .then(async poll => {
               await pollNumber.increment();
               poll.pollNumber = pollNumber.pollsCreated;
               return await poll.save();
            });

         const updateVoterPromise = [...newPoll.allowedUsers.keys()].map(
            async key => {
               let user = await User.findOne({
                  guildId: guildId,
                  discordId: key,
               }).exec();

               if (!user) {
                  Logger.warn(
                     'events/poll/newProposalPoll.js: User does not exist yet. Creating new user.',
                  );

                  const {
                     roles: { cache: userRoleCache },
                  } = allowedUsers.get(key);

                  const eligibleChannels = await User.findEligibleChannels(
                     userRoleCache,
                  );

                  user = await User.createUser(guildId, key, eligibleChannels);

                  Logger.debug(
                     'events/poll/newProposalPoll.js: Successfully created new user.',
                     { user: user },
                  );
               } else if (
                  user.eligibleChannels !== null &&
                  user.eligibleChannels.has(newPoll.config.channelId)
               ) {
                  Logger.debug(
                     'events/poll/newProposalPoll.js: User exists and has channel key!',
                  );

                  user.eligibleChannels.get(newPoll.config.channelId)
                     .eligiblePolls++;
               } else {
                  Logger.warn(
                     'events/poll/newProposalPoll.js: User did not have the appropriate key. Attempting to set key.',
                     {
                        key: newPoll.config.channelId,
                     },
                  );

                  user.eligibleChannels.set(newPoll.config.channelId, {
                     eligiblePolls: 1,
                     participatedPolls: 0,
                  });
               }

               user.markModified('eligibleChannels');
               return await user.save();
            },
         );

         await Promise.all(updateVoterPromise);

         const updatedEmbed = new MessageEmbed(messageObject.embeds[0]);

         // const timeEndMilli = new Date(
         //    newPoll.timeCreated.getTime() + durationMs

         //    // !testing switching the time for testing purposes
         //    // savedPoll.timeCreated.getTime() + 30000
         // );
         // newPoll.timeEnd = timeEndMilli.toISOString();
         // await newPoll.save();

         updatedEmbed.setFooter({
            text: `Poll #${newPoll.pollNumber} submitted by ${
               nickname ?? username
            }#${discriminator}`,
         });

         let embedQuorum = Math.ceil(
            newPoll.allowedUsers.size * (channelConfig.quorum / 100),
         );

         embedQuorum = embedQuorum > 1 ? embedQuorum : 1;

         updatedEmbed.fields[1].value = embedQuorum.toString(); // quorum

         updatedEmbed.fields[4].value = `<t:${Math.floor(
            newPoll.timeEnd.getTime() / 1000,
         )}:f>`; // timeEnd

         messageObject.embeds[0] = updatedEmbed;

         const threadName =
            title.length <= 100 ? title : `${title.substring(0, 96)}...`;

         await interaction.edit(messageObject);
         await interaction.startThread({
            name: threadName,
            autoArchiveDuration: 10080, // todo probably make this based on channelConfig?
         });
         await interaction.thread.send(`**Discussion:**`);

         await interaction.react('✅');

         client.emit('enqueuePoll', newPoll);

         Logger.info(
            'events/poll/newProposalPoll.js: Finished creating proposal.',
         );
      } catch (error) {
         Logger.error('events/poll/newProposalPoll.js: Encountered an error.', {
            error: error,
         });
      }
   },
};
