// todo I should rename newProposal to reduce confusion maybe? Will workshop it
const { EmbedBuilder, TextChannel } = require('discord.js');
const { Types } = require('mongoose');

const { generateInitialPollMessage } = require('../../views/embeds/polls');
const PollChannel = require('../../db/schemas/PollChannel');
const PollCount = require('../../db/schemas/ChannelPollCount');
const Poll = require('../../db/schemas/Poll');
const User = require('../../db/schemas/User');
const UrlConfig = require('../../db/schemas/UrlConfig');
const Logger = require('../../helpers/logger');
const {
   generatePropCreatedEmbed,
} = require('../../views/embeds/contracts/nouns-dao');
const {
   isNouncilChannel,
   updateNouncillorDateJoined,
} = require('../../helpers/nouncillor');

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
         embeds: [generatePropCreatedEmbed(proposal, propUrl)],
      });

      const {
         client,
         guildId,
         guild: {
            roles: {
               everyone: { id: everyoneId },
            },
         },
         member: {
            nickname,
            user,
            user: { username, discriminator },
         },
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

      const messageObject = await generateInitialPollMessage({
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

      if (isNouncilChannel(channel.id)) {
         await updateNouncillorDateJoined([...snapshotMap.keys()]);
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
            messageId: interaction.id,
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
               return poll.save();
            });

         User.updateUserParticipation(newPoll, guildId);

         const updatedEmbed = new EmbedBuilder(messageObject.embeds[0]);

         updatedEmbed.setFooter({
            text: `Poll #${newPoll.pollNumber} submitted by ${
               nickname ?? username
            }#${discriminator}`,
         });

         let embedQuorum = Math.ceil(
            newPoll.allowedUsers.size * (channelConfig.quorum / 100),
         );

         embedQuorum = embedQuorum > 1 ? embedQuorum : 1;

         updatedEmbed.data.fields[1].value = embedQuorum.toString(); // quorum

         updatedEmbed.data.fields[4].value = `<t:${Math.floor(
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
