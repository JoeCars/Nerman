const {
   CommandInteraction,
   EmbedBuilder,
   roleMention,
   codeBlock,
} = require('discord.js');

const Poll = require('../../../db/schemas/Poll');
const PollChannel = require('../../../db/schemas/PollChannel');

const ResultBar = require('../../../structures/ResultBar');
const { generateInitialPollMessage } = require('../../../views/embeds/polls');
const { longestString } = require('../../../helpers/poll');
const { authorizeInteraction } = require('../../../helpers/authorization');

const Logger = require('../../../helpers/logger');

module.exports = {
   subCommand: 'nerman.regenerate-poll-message',
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/nerman/poll/regeneratePollMessage.js: Starting to regenerate poll message.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );

      const {
         channelId,
         channel,
         guild: {
            members: { cache: memberCache },
            roles: {
               everyone: { id: everyoneId },
            },
         },
      } = interaction;

      await interaction.deferReply({ ephemeral: true });

      await authorizeInteraction(interaction, 3);

      // todo maybe convert this over to access the config from the guildConfigs collection within Nerman -- going to wait on migratiung these over for now, only sticking to using it this way where I need it, until I can account for new error/security issues in this method
      const configExists = await PollChannel.configExists(channelId);

      Logger.debug(
         'commands/nerman/poll/regeneratePollMessage.js: Checking if the guild config exists.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            configExists: configExists,
         },
      );

      // Test existence of channel configuration
      if (!configExists) {
         return interaction.reply({
            content:
               'There are no configurations registered to this channel. You may only register from a channel in which polling has been configured.',
            ephemeral: true,
         });
      }

      // todo add in logic to check if the document already has existing vote entries and regenerate the message to reflect those votes
      // todo also add in logic to check to see if the poll is closed, and if so, make sure the message is not regenerated as an open poll, or just error out the command perhaps so that it can not be used on closed polls

      // Actually retrieve configuration
      const channelConfig = await PollChannel.findOne(
         { channelId },
         'allowedRoles maxUserProposal voteAllowance quorum liveVisualFeed',
      ).exec();

      const messageId = interaction.options.getString('message-id');
      const embedOnly = interaction.options.getBoolean('embed-only');
      const noChannelMessage =
         interaction.options.getBoolean('no-original-message') ?? false;

      Logger.debug(
         'commands/nerman/poll/regeneratePollMessage.js: Checking message ID and no-channel-message.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            noChannelMessage: noChannelMessage,
            messageId: messageId,
         },
      );

      const associatedPoll = await Poll.findOne()
         .byMessageId(messageId)
         .populate([
            { path: 'config' },
            { path: 'countVoters' },
            { path: 'getVotes' },
         ])
         .exec();

      if (associatedPoll === null) {
         throw new Error('This message has no polls associated with it.');
      }

      const {
         // client,
         creatorId,
         pollData: { title, description },
      } = associatedPoll;

      let messageToUpdate;

      if (noChannelMessage === false) {
         messageToUpdate = await channel.messages.fetch(messageId);

         Logger.debug(
            'commands/nerman/poll/regeneratePollMessage.js: Fetched message to update',
            {
               userId: interaction.user.id,
               guildId: interaction.guildId,
               channelId: interaction.channelId,
               messageToUpdate: messageToUpdate,
            },
         );
      }

      if (!embedOnly) {
         const messageObject = await generateInitialPollMessage({
            title,
            description,
            channelConfig,
            everyoneId,
         });

         const messageEmbed = messageObject.embeds[0];

         Logger.debug(
            'commands/nerman/poll/regeneratePollMessage.js: Retrieved message embed.',
            {
               userId: interaction.user.id,
               guildId: interaction.guildId,
               channelId: interaction.channelId,
               messageEmbed: messageEmbed,
            },
         );

         const {
            nickname,
            user: { username, discriminator },
         } = await memberCache.get(creatorId);

         Logger.debug(
            'commands/nerman/poll/regeneratePollMessage.js: User extra user information.',
            {
               userId: interaction.user.id,
               guildId: interaction.guildId,
               channelId: interaction.channelId,
               nickname: nickname,
               username: username,
               discriminator: discriminator,
            },
         );

         messageEmbed.setFooter({
            text: `Poll #${associatedPoll.pollNumber} submitted by ${
               nickname ?? username
            }#${discriminator}`,
         });

         let embedQuorum = await Math.ceil(
            associatedPoll.allowedUsers.size * (channelConfig.quorum / 100),
         );

         embedQuorum = embedQuorum > 1 ? embedQuorum : 1;

         messageEmbed.data.fields.find(({ name }) => name === 'Quorum').value =
            embedQuorum.toString();

         messageEmbed.data.fields.find(
            ({ name }) => name === 'Voting Closes',
         ).value = `<t:${Math.floor(
            associatedPoll.timeEnd.getTime() / 1000,
         )}:f>`;

         messageObject.embeds[0] = messageEmbed;

         const threadName =
            associatedPoll.pollData.title.length <= 100
               ? associatedPoll.pollData.title
               : `${associatedPoll.pollData.title.substring(0, 96)}...`;

         const newMsg = await channel.send(messageObject);
         await newMsg.startThread({
            name: threadName,
            autoArchiveDuration: 10080, // todo probably make this based on channelConfig?
         });

         Logger.debug(
            'commands/nerman/poll/regeneratePollMessage.js: Checking new message.',
            {
               userId: interaction.user.id,
               guildId: interaction.guildId,
               channelId: interaction.channelId,
               newMessage: newMsg,
            },
         );

         associatedPoll.messageId = newMsg.id;
         await associatedPoll.save();

         if (noChannelMessage === false) {
            messageToUpdate.delete();
         }
      } else {
         const mentions = await channelConfig.allowedRoles
            .map(role =>
               role !== everyoneId ? roleMention(role) : '@everyone',
            )
            .join(' ');

         const embedQuorum = Math.ceil(
            associatedPoll.allowedUsers.size * (channelConfig.quorum / 100),
         );

         console.log(
            'messageToUpdate?.embeds[0].description => ',
            messageToUpdate.embeds[0]?.description,
         );

         const newEmbedFields = [
            { name: '\u200B', value: '\u200B', inline: false },
            { name: 'Quorum', value: `${embedQuorum}`, inline: true },
            {
               name: 'Voters',
               value: `${associatedPoll.abstains.size ?? '0'}`,
               inline: true,
            },
            {
               name: 'Abstains',
               value: `${associatedPoll.countVoters ?? '0'}`,
               inline: true,
            },
            {
               name: 'Voting Closes',
               value: `<t:${Math.floor(
                  associatedPoll.timeEnd.getTime() / 1000,
               )}:f>`,
               inline: false,
            },
         ];

         if (associatedPoll.config.liveVisualFeed === true) {
            let embedResults = messageToUpdate.embeds[0]?.fields.find(
               ({ name }) => name === 'Results',
            )?.value;

            console.log(
               'commands/slashCommands/poll/regeneratePollMessage.js: \nif(liveVisualFeed === true)\nembedResults => ',
               embedResults,
            );

            console.log(
               'commands/slashCommands/poll/regeneratePollMessage.js: \nif(!embedResults) => ',
               !embedResults,
            );

            // todo Once again, I need to abstract this whole mess here. I'm basically salivating for the chance to, but right now I just have to move fast on other things.
            if (!embedResults) {
               console.log(
                  'commands/slashCommands/poll/regeneratePollMessage.js: \nif(!embedResults)\nTRUE -- accessing if() clausee',
               );

               const results = associatedPoll.results;
               const longestOption = longestString(
                  associatedPoll.pollData.choices,
               ).length;

               console.log(
                  'events/poll/pollVote.js -- longestOption => ',
                  longestOption,
               );

               console.log(
                  'events/poll/pollVote.js -- associatedPoll.config => ',
                  associatedPoll.config,
               );

               const resultsArray = associatedPoll.config.voteThreshold
                  ? [
                       `Threshold: ${associatedPoll.voteThreshold} ${
                          associatedPoll.voteThreshold > 1 ? 'votes' : 'vote'
                       }\n`,
                    ]
                  : [];

               let resultsOutput = [];

               const barWidth = 8;
               const totalVotes = results.totalVotes;

               const votesMap = new Map([
                  ['maxLength', barWidth],
                  ['totalVotes', totalVotes],
               ]);
               for (const key in results.distribution) {
                  const label = key[0].toUpperCase() + key.substring(1);

                  const votes = results.distribution[key];
                  const room = longestOption - label.length;
                  const optionObj = new ResultBar(label, votes, room, votesMap);

                  votesMap.set(label, optionObj);
                  resultsArray.push(optionObj.completeBar);
               }

               resultsArray.push(`\nAbstains: ${associatedPoll.abstains.size}`);

               resultsOutput = codeBlock(resultsArray.join('\n'));

               embedResults = resultsOutput;
            }

            newEmbedFields.splice(1, 0, {
               name: 'Results',
               value: embedResults,
               inline: false,
            });
         }

         let footer = messageToUpdate.embeds[0]?.footer.text;

         if (!footer) {
            const {
               displayName,
               user: { discriminator },
            } = memberCache.get(associatedPoll.creatorId);

            footer = `Poll #${associatedPoll.pollNumber} submitted by ${displayName}#${discriminator}`;
         }

         const updateEmbed = new EmbedBuilder()
            .setColor(`#ffffff`)
            .setTitle(title)
            .setDescription(description)
            .addFields(newEmbedFields)
            .setFooter({ text: footer });

         if (associatedPoll.status === 'closed') {
            const eligibleVoters = associatedPoll.allowedUsers.size;

            let winningResult = '';
            const results = await associatedPoll.results;

            console.log({ results });

            if ('winner' in results) {
               console.log(results.winner);
               winningResult =
                  results.winner !== null
                     ? `${
                          results.winner[0].toUpperCase() +
                          results.winner.substring(1)
                       } - Wins`
                     : 'Literally nobody voted on this :<';
            }

            if ('tied' in results) {
               winningResult = `${results.tied
                  .flatMap(arr => arr[0][0].toUpperCase() + arr[0].substring(1))
                  .join(', ')} - Tied`;
            }

            const failedChecks = [];

            if (results.quorumPass === false) {
               failedChecks.push('quorum');
            }

            if (results.thresholdPass === false) {
               failedChecks.push('vote threshold');
            }

            const longestOption = longestString(
               associatedPoll.pollData.choices,
            ).length;

            const resultsArray = associatedPoll.config.voteThreshold
               ? [
                    `Threshold: ${associatedPoll.voteThreshold} ${
                       associatedPoll.voteThreshold > 1 ? 'votes' : 'vote'
                    }\n`,
                 ]
               : [];
            let resultsOutput = [];

            const barWidth = 8;
            const totalVotes = associatedPoll.results.totalVotes;

            const votesMap = new Map([
               ['maxLength', barWidth],
               ['totalVotes', totalVotes],
            ]);

            for (const key in results.distribution) {
               const label = key[0].toUpperCase() + key.substring(1);

               const votes = results.distribution[key];
               const room = longestOption - label.length;
               const optionObj = new ResultBar(label, votes, room, votesMap);

               votesMap.set(label, optionObj);
               resultsArray.push(optionObj.completeBar);
            }

            resultsOutput = codeBlock(resultsArray.join('\n'));

            const votersValue = `Quorum: ${
               associatedPoll.voterQuorum
            }\n\nParticipated: ${
               associatedPoll.countVoters + associatedPoll.countAbstains
            }\nEligible: ${eligibleVoters}`;

            const closedFields = [
               {
                  name: 'RESULTS',
                  value: codeBlock(winningResult),
                  inline: false,
               },
               {
                  name: 'VOTES',
                  value: resultsOutput,
                  inline: false,
               },
               {
                  name: 'VOTERS',
                  value: codeBlock(votersValue),
                  inline: false,
               },
            ];

            updateEmbed.spliceFields(1, 4, closedFields);

            messageToUpdate.edit({
               content: mentions,
               embeds: [updateEmbed],
               components: [],
            });
         } else if (associatedPoll.status === 'cancelled') {
            const closedFields = [
               {
                  name: 'CANCELLED',
                  value: '\u200B',
                  inline: false,
               },
            ];

            updateEmbed.spliceFields(1, 4, closedFields);

            messageToUpdate.edit({
               content: null,
               embeds: [updateEmbed],
               components: [],
            });
         } else {
            try {
               messageToUpdate.edit({
                  content: mentions,
                  embeds: [updateEmbed],
               });
            } catch (error) {
               console.error(error);
            }
         }

         // todo make sure I can regenerate if closed
      }
      await interaction.editReply({ content: 'Regeneration finished!' });
      Logger.info(
         'commands/nerman/poll/regeneratePollMessage.js: Finished regenerating poll message.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );
   },
};
