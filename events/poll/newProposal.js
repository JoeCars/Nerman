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
const { logToObject } = require('../../utils/functions');
const { log: l } = console;

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

      const propChannel = await cache.get(propChannelId);
      // const nounsGovChannel = guildCache
      //    .get(process.env.DISCORD_GUILD_ID)
      //    .channels.cache.get(nounsGovId);
      const nounsGovChannel = await cache.get(nounsGovId);
      // const testConExists = await PollChannel.configExists(propChannel.id);
      // console.log({ testConExists });
      const configExists = await PollChannel.configExists(propChannel.id);
      console.log({ configExists });
      if (!configExists) {
         l('NO CHANNEL CONFIG ---- RETURNING');
         return;
      }

      // l({ title });

      l({ interaction });
      l({ proposal });

      const { id: propId, description: desc } = proposal;
      const titleRegex = new RegExp(/^#+\s+.+\n/);

      const title = `Prop ${propId}: ${desc
         .match(titleRegex)[0]
         .replaceAll(/^(#\s)|(\n+)$/g, '')}`;
      const description = `https://nouns.wtf/vote/${propId}`;

      l({ title });

      const channelConfig = await PollChannel.findOne(
         {
            channelId: propChannelId,
         },
         '_id allowedRoles quorum duration'
      ).exec();

      // const intRegex = new RegExp(/^\d*$/);

      console.log({ everyoneId });
      console.log(channelConfig.allowedRoles);

      const messageObject = await initPollMessage({
         propId,
         title,
         description,
         channelConfig,
         everyoneId,
      });

      console.log(
         '-----------------------------------------------\n',
         messageObject.embeds,
         '-----------------------------------------------\n'
      );

      const pollData = {
         title,
         description,
         voteAllowance: 1,
         choices: ['yes', 'no', 'abstain'],
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
         console.error({ error });
      }

      const countExists = await PollCount.checkExists(propChannelId);

      console.log({ countExists });

      let pollNumber;

      if (!countExists) {
         console.log('Count does not exist');
         pollNumber = await PollCount.createCount(propChannelId);
      } else {
         console.log('Count exists');
         pollNumber = await PollCount.findOne({
            channelId: propChannelId,
         }).exec();
      }

      console.log({ pollNumber });

      try {
         // todo refactor this to use {new: true} and return the document perhaps, rather than this two part operation?
         console.group('Create Poll Attributes');
         console.log({ guildId });
         console.log(user.id);
         console.log(channelConfig._id);
         console.log(interaction.id);
         console.log({ pollData });
         console.groupEnd('Create Poll Attributes');

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
               console.log('WITHIN THE THEN', { poll });
               await pollNumber.increment();
               poll.pollNumber = pollNumber.pollsCreated;
               return await poll.save();
            });

         const updateVoterPromise = [...newPoll.allowedUsers.keys()].map(
            async key => {
               l({ key });

               let user = await User.findOne({
                  guildId: guildId,
                  discordId: key,
               }).exec();

               if (!user) {
                  l(
                     'User does not yet exist, creating new user from allowedUsers map...'
                  );

                  const {
                     roles: { cache: userRoleCache },
                  } = allowedUsers.get(key);

                  const eligibleChannels = await User.findEligibleChannels(
                     userRoleCache
                  );

                  user = await User.createUser(guildId, key, eligibleChannels);

                  l('User created! => ', user);
               } else if (
                  user.eligibleChannels !== null &&
                  user.eligibleChannels.has(newPoll.config.channelId)
               ) {
                  l(
                     'User exists and has channel key!'
                  );

                  user.eligibleChannels.get(newPoll.config.channelId)
                     .eligiblePolls++;
               } else {
                  l(
                     `user did not have the key: ${newPoll.config.channelId} present in their eligibleChannels Map.\n Attempting to set key...`
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

         console.log({ newPoll });
         let updatedEmbed = new MessageEmbed(messageObject.embeds[0]);

         console.log(newPoll);
         console.log(newPoll.timeCreated);

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

         let embedQuorum = Math.floor(
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
      } catch (error) {
         // console.log('BIG FAT FUCKN ERROR, BRUH');
         console.error(error);
      }
   },
};
