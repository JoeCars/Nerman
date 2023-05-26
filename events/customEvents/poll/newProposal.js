const {
   MessageEmbed,
   MessageButton,
   MessageActionRow,
   Message,
} = require('discord.js');
const { roleMention } = require('@discordjs/builders');
const { Types } = require('mongoose');

const { initPollMessage } = require('../../helpers/poll/initPollMessage');
const PollChannel = require('../../db/schemas/PollChannel');
const PollCount = require('../../db/schemas/ChannelPollCount');
const Poll = require('../../db/schemas/Poll');
const User = require('../../db/schemas/User');
const Logger = require('../../helpers/logger');

// todo I will need to change this to the new Nouncil channel once Joel gives the go-ahead
const propChannelId =
   process.env.DEPLOY_STAGE === 'staging'
      ? process.env.TESTNERMAN_NOUNCIL_CHAN_ID
      : process.env.DEVNERMAN_NOUNCIL_CHAN_ID;

const nounsGovId = process.env.NOUNS_GOV_ID;

module.exports = {
   name: 'newProposal',
   /**
    * @param {Message} interaction
    */
   async execute(interaction, proposal) {
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

      Logger.info('events/poll/newProposal.js: Creating new proposal.', {
         guildId: guildId,
         member: username,
      });

      const propChannel = await cache.get(propChannelId);
      // const nounsGovChannel = guildCache
      //    .get(process.env.DISCORD_GUILD_ID)
      //    .channels.cache.get(nounsGovId);
      const nounsGovChannel = await cache.get(nounsGovId);
      // const testConExists = await PollChannel.configExists(propChannel.id);
      // console.log({ testConExists });
      const configExists = await PollChannel.configExists(propChannel.id);
      Logger.debug('events/poll/newProposal.js: Checking config exists.', {
         configExists: configExists,
         guildId: guildId,
         member: username,
      });

      if (!configExists) {
         Logger.info('events/poll/newProposal.js: No config exists. Exiting.', {
            guildId: guildId,
            member: username,
         });
         return;
      }

      const { id: propId, description: desc } = proposal;
      const titleRegex = new RegExp(/^#+\s+.+\n/);

      const title = `Prop ${propId}: ${desc
         .match(titleRegex)[0]
         .replaceAll(/^(#\s)|(\n+)$/g, '')}`;
      const description = `https://nouns.wtf/vote/${propId}`;

      Logger.debug('events/poll/newProposal.js: Checking proposal.', {
         guildId: guildId,
         member: username,
         title: title,
         propId: propId,
      });

      const channelConfig = await PollChannel.findOne(
         {
            channelId: propChannelId,
         },
         '_id allowedRoles quorum duration forAgainst'
      ).exec();

      Logger.debug('events/poll/newProposal.js: Checking roles and IDs.', {
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
         choices:
            channelConfig.forAgainst === true
               ? ['for', 'against']
               : ['yes', 'no'],
      };

      const snapshotMap = new Map();

      // todo try to implement env for the allowed roles so that we can do this dynamically when hosting and using in other servers
      // todo also this should be done via fetching the config
      let allowedUsers;
      try {
         // const allowedUsers = await message.guild.members
         // const allowedUsers = await interaction.guild.members
         allowedUsers = await interaction.guild.members
            .fetch({
               withPresences: true,
            })
            .then(fetchedMembers => {
               // console.log(fetchedMembers);
               return fetchedMembers.filter(member => {
                  // console.log(member);
                  return (
                     !member.user.bot &&
                     member?.roles.cache.hasAny(...channelConfig.allowedRoles)
                  );
                  //disabled not worrying about the online presence
                  // return (
                  //    member.presence?.status === 'online' &&
                  //    !member.user.bot &&
                  //    member?.roles.cache.hasAny(...channelConfig.allowedRoles)
                  // );
               });
            });

         for (const key of allowedUsers.keys()) {
            snapshotMap.set(key, false);
         }
      } catch (error) {
         Logger.error('events/poll/newProposal.js: Error.', { error: error });
      }

      const countExists = await PollCount.checkExists(propChannelId);

      Logger.debug('events/poll/newProposal.js: Checking existing count.', {
         guildId: guildId,
         member: username,
         countExists: countExists,
      });

      let pollNumber;

      if (!countExists) {
         pollNumber = await PollCount.createCount(propChannelId);
      } else {
         pollNumber = await PollCount.findOne({
            channelId: propChannelId,
         }).exec();
      }

      try {
         // todo refactor this to use {new: true} and return the document perhaps, rather than this two part operation?
         Logger.debug('events/poll/newProposal.js: Checking poll attributes.', {
            guildId: guildId,
            userId: user.id,
            channelConfigId: channelConfig._id,
            interactionId: interaction.id,
            pollData: pollData,
         });

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
                     'events/poll/newProposal.js: User does not exist yet. Creating new user.'
                  );

                  const {
                     roles: { cache: userRoleCache },
                  } = allowedUsers.get(key);

                  const eligibleChannels = await User.findEligibleChannels(
                     userRoleCache
                  );

                  user = await User.createUser(guildId, key, eligibleChannels);

                  Logger.debug(
                     'events/poll/newProposal.js: Successfully created new user.',
                     { user: user }
                  );
               } else if (
                  user.eligibleChannels !== null &&
                  user.eligibleChannels.has(newPoll.config.channelId)
               ) {
                  Logger.debug(
                     'events/poll/newProposal.js: User exists and has channel key!'
                  );

                  user.eligibleChannels.get(newPoll.config.channelId)
                     .eligiblePolls++;
               } else {
                  Logger.warn(
                     'events/poll/newProposal.js: User did not have the appropriate key. Attempting to set key.',
                     {
                        key: newPoll.config.channelId,
                     }
                  );

                  user.eligibleChannels.set(newPoll.config.channelId, {
                     eligiblePolls: 1,
                     participatedPolls: 0,
                  });
               }

               user.markModified('eligibleChannels');
               return await user.save();
            }
         );

         await Promise.all(updateVoterPromise);

         let updatedEmbed = new MessageEmbed(messageObject.embeds[0]);

         // const timeEndMilli = new Date(
         //    newPoll.timeCreated.getTime() + durationMs

         //    // !testing switching the time for testing purposes
         //    // savedPoll.timeCreated.getTime() + 30000
         // );
         // newPoll.timeEnd = timeEndMilli.toISOString();
         // await newPoll.save();

         updatedEmbed.setFooter(
            `Poll #${newPoll.pollNumber} submitted by ${
               nickname ?? username
            }#${discriminator}`
         );

         let embedQuorum = Math.ceil(
            newPoll.allowedUsers.size * (channelConfig.quorum / 100)
         );

         embedQuorum = embedQuorum > 1 ? embedQuorum : 1;

         updatedEmbed.fields[1].value = embedQuorum.toString(); // quorum

         updatedEmbed.fields[4].value = `<t:${Math.floor(
            newPoll.timeEnd.getTime() / 1000
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

         let nounsGovMessage = await nounsGovChannel.send({
            content: 'New proposal data...',
         });

         client.emit('propCreated', nounsGovMessage, newPoll, propId);

         Logger.info('events/poll/newProposal.js: Finished creating proposal.');
      } catch (error) {
         Logger.error('events/poll/newProposal.js: Encountered an error.', {
            error: error,
         });
      }
   },
};
