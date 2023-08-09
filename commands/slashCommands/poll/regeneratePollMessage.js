const {
   CommandInteraction,
   MessageEmbed,
   EmbedBuilder,
} = require('discord.js');
const { roleMention, codeBlock } = require('@discordjs/builders');

const Poll = require('../../../db/schemas/Poll');
const PollChannel = require('../../../db/schemas/PollChannel');

const ResultBar = require('../../../structures/ResultBar');
const { initPollMessage } = require('../../../helpers/poll/initPollMessage');
const { drawBar, longestString } = require('../../../helpers/poll');
const { authorizeInteraction } = require('../../../helpers/authorization');

const Logger = require('../../../helpers/logger');
const { log: l } = console;

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
         client,
         user: { id: userId },
         member: {
            roles: { cache: roleCache },
         },
         guild: {
            members: { cache: memberCache },
            roles: {
               everyone: { id: everyoneId },
            },
         },
      } = interaction;

      await interaction.deferReply({ ephemeral: true });

      // if (!(await PollChannel.countDocuments({ channelId }))) {
      // disabled until we find a better way to handle the cross-guild admin permissions when accessing bot commands
      // if (!roleCache.has(guildAdminId)) {
      // throw new Error('This is an admin-only command');
      // }

      // todo later on change permissions associated with this, once we decide one how to tdeal with the cross guild shenanigans

      await authorizeInteraction(interaction, 3);

      // return await interaction.editReply({ content: 'TEST END' });

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
         // throw new Error('Testing this error throw nonsense');
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

      if (associatedPoll === null)
         throw new Error('This message has no polls associated with it.');

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
         let messageObject = await initPollMessage({
            title,
            description,
            channelConfig,
            everyoneId,
         });

         let messageEmbed = messageObject.embeds[0];

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

         messageEmbed.setFooter(
            `Poll #${associatedPoll.pollNumber} submitted by ${
               nickname ?? username
            }#${discriminator}`,
         );

         // l('MESSAGE EMBED WITH FOOTER WOW\n', messageEmbed);

         let embedQuorum = await Math.ceil(
            associatedPoll.allowedUsers.size * (channelConfig.quorum / 100),
         );

         embedQuorum = embedQuorum > 1 ? embedQuorum : 1;

         // messageEmbed.fields[1].value = embedQuorum.toString();
         messageEmbed.fields.find(({ name }) => name === 'Quorum').value =
            embedQuorum.toString();
         // l('MESSAGE EMBED WITH QUORUM TOO?!\n', messageEmbed);

         // messageEmbed.fields[4].value = `<t:${Math.floor(
         //    associatedPoll.timeEnd.getTime() / 1000
         // )}:f>`;
         messageEmbed.fields.find(
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
         // disabled for meow
         // const updateEmbed = new MessageEmbed(messageToUpdate.embeds[0]);

         const embedTitle = associatedPoll.pollData.title;

         const mentions = await channelConfig.allowedRoles
            .map(role =>
               role !== everyoneId ? roleMention(role) : '@everyone',
            )
            .join(' ');

         // disabled for meow
         // updateEmbed.setTitle(embedTitle);

         // updateEmbed.setFooter(
         //    `Poll #${associatedPoll.pollNumber} submitted by ${
         //       nickname ?? username
         //    }#${discriminator}`,
         // );

         let embedQuorum = Math.ceil(
            associatedPoll.allowedUsers.size * (channelConfig.quorum / 100),
         );

         console.log(
            'messageToUpdate?.embeds[0].description => ',
            messageToUpdate.embeds[0]?.description,
         );

         let newEmbedFields = [
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

               let resultsArray = associatedPoll.config.voteThreshold
                  ? [
                       `Threshold: ${associatedPoll.voteThreshold} ${
                          associatedPoll.voteThreshold > 1 ? 'votes' : 'vote'
                       }\n`,
                    ]
                  : [];

               let resultsOutput = [];

               const barWidth = 8;
               let totalVotes = results.totalVotes;
               // let totalVotes = associatedPoll.results.totalVotes;

               let votesMap = new Map([
                  ['maxLength', barWidth],
                  ['totalVotes', totalVotes],
               ]);
               for (const key in results.distribution) {
                  const label = key[0].toUpperCase() + key.substring(1);

                  console.log('db/index.js -- label => ', label);
                  console.log('db/index.js -- label.length => ', label.length);
                  console.log(
                     'db/index.js -- logging :  longestOption - label.length => ',
                     longestOption - label.length,
                  );
                  const votes = results.distribution[key];
                  const room = longestOption - label.length;
                  let optionObj = new ResultBar(label, votes, room, votesMap);

                  console.log('optionObj => ', optionObj);
                  console.log(
                     'optionObj.completeBar => ',
                     optionObj.completeBar,
                  );

                  votesMap.set(label, optionObj);
                  // resultsArray.splice(-1, 0, optionObj.completeBar);
                  resultsArray.push(optionObj.completeBar);
               }

               resultsArray.push(`\nAbstains: ${associatedPoll.abstains.size}`);

               // console.log(votesMap);

               // resultsOutput = resultsArray.join('\n');
               resultsOutput = codeBlock(resultsArray.join('\n'));

               embedResults = resultsOutput;

               console.log(
                  'commands/slashCommands/poll/regeneratePollMessage.js: \nif(liveVisualFeed === true)\nif(!embedResults) TRUE\nnewly created embedResults => ',
                  embedResults,
               );
            }

            newEmbedFields.splice(1, 0, {
               name: 'Results',
               value: embedResults,
               inline: false,
            });
         }

         console.log('newEmbedFields => ', newEmbedFields);

         console.log(
            'messageToUpdate?.embeds[0].footer => ',
            messageToUpdate.embeds[0]?.footer,
         );

         console.log(
            'messageToUpdate?.embeds[0].footer.text => ',
            messageToUpdate.embeds[0]?.footer.text,
         );
         let footer = messageToUpdate.embeds[0]?.footer.text;
         // let description = messageToUpdate.embeds[0]?.description;

         if (!footer) {
            const {
               displayName,
               user: { discriminator },
            } = memberCache.get(associatedPoll.creatorId);

            console.log({ discriminator });
            console.log({ displayName });

            footer = `Poll #${associatedPoll.pollNumber} submitted by ${displayName}#${discriminator}`;
         }

         // if (!description) {
         //    const {
         //       displayName,
         //       user: { discriminator },
         //    } = memberCache.get(associatedPoll.creatorId);

         //    console.log({ discriminator });
         //    console.log({ displayName });

         //    footer = `Poll #${associatedPoll.pollNumber} submitted by ${displayName}#${discriminator}`;
         // }

         console.log({ title, description, newEmbedFields, footer });
         let updateEmbed = new MessageEmbed()
            .setColor(`#ffffff`)
            .setTitle(title)
            // .setTitle(embedTitle)
            // .setDescription(`${messageToUpdate.embeds[0].description ?? ''}`)
            .setDescription(description)
            .addFields(newEmbedFields)
            .setFooter(footer);
         // .setFooter(messageToUpdate.embeds[0].footer.text);

         console.log('updateEmbed => ', updateEmbed);

         // embedQuorum = embedQuorum > 1 ? embedQuorum : 1;

         // disabled for meow
         // if (updateEmbed.fields[1]) {
         // if (!!updateEmbed.fields.find(({ name }) => name === 'Quorum')) {
         //    updateEmbed.fields.find(({ name }) => name === 'Quorum').value =
         //       embedQuorum.toString();
         // }

         // if (!updateEmbed.fields.find(({ name }) => name === 'Voting Closes')) {
         //    const timeClose = {
         //       name: 'Voting Closes',
         //       value: `<t:${Math.floor(
         //          associatedPoll.timeEnd.getTime() / 1000
         //       )}:f>`,
         //       inline: false,
         //    };

         //    updateEmbed.spliceFields(updateEmbed.fields.length, 0, timeClose);
         // }

         // newEmbed.addFields(newEmbedFields);

         // disabled for meow
         // if (
         //    !!updateEmbed.fields.find(({ name }) => name === 'Voting Closes')
         // ) {
         //    // if (updateEmbed.fields[4]) {
         //    updateEmbed.fields.find(
         //       ({ name }) => name === 'Voting Closes'
         //    ).value = `<t:${Math.floor(
         //       associatedPoll.timeEnd.getTime() / 1000
         //    )}:f>`;
         // }

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

            let failedChecks = [];

            console.log(
               'nerman/admin/regeneratePollMessages.js -- jsfailedChecks before checks=> ',
               failedChecks,
            );

            if (results.quorumPass === false) {
               failedChecks.push('quorum');
            }

            if (results.thresholdPass === false) {
               failedChecks.push('vote threshold');
            }

            console.log(
               'nerman/admin/regeneratePollMessages.js -- jsfailedChecks after checks=> ',
               failedChecks,
            );

            console.log(
               'admin/regeneratePollMessage.js -- associatedPoll.pollSucceeded PRE checks => ',
               associatedPoll.pollSucceeded,
            );

            // if (failedChecks.length) {
            //    associatedPoll.pollSucceeded = false;
            //    winningResult = `Poll failed to meet ${failedChecks.join(
            //       ' and '
            //    )}.`;
            // } else {
            //    associatedPoll.pollSucceeded = true;
            // }

            // console.log(
            //    'admin/regeneratePollMessage.js -- associatedPoll.pollSucceeded POST checks => ',
            //    associatedPoll.pollSucceeded
            // );

            const longestOption = longestString(
               associatedPoll.pollData.choices,
            ).length;
            // let resultsArray = ['```', '```'];
            let resultsArray = associatedPoll.config.voteThreshold
               ? [
                    `Threshold: ${associatedPoll.voteThreshold} ${
                       associatedPoll.voteThreshold > 1 ? 'votes' : 'vote'
                    }\n`,
                 ]
               : [];
            let resultsOutput = [];

            const barWidth = 8;
            let totalVotes = associatedPoll.results.totalVotes;

            let votesMap = new Map([
               ['maxLength', barWidth],
               ['totalVotes', totalVotes],
            ]);

            for (const key in results.distribution) {
               const label = key[0].toUpperCase() + key.substring(1);

               const votes = results.distribution[key];
               const room = longestOption - label.length;
               let optionObj = new ResultBar(label, votes, room, votesMap);

               votesMap.set(label, optionObj);
               // resultsArray.splice(-1, 0, optionObj.completeBar);
               resultsArray.push(optionObj.completeBar);
            }

            // resultsOutput = resultsArray.join('\n');
            resultsOutput = codeBlock(resultsArray.join('\n'));

            // let closedEmbed = message.embeds[0];
            // console.log({ closedEmbed });

            // closedEmbed.setTitle(`${closedEmbed.title}`);

            // console.log({ closedEmbed });

            console.log(
               'admin/regeneratePollMessage.js -- associatedPoll.countVoters =>',
               associatedPoll.countVoters,
            );
            console.log(
               'admin/regeneratePollMessage.js -- associatedPoll.countAbstains =>',
               associatedPoll.countAbstains,
            );

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

            // const closedFields = [
            //    {
            //       name: 'RESULTS',
            //       value: codeBlock(winningResult),
            //       inline: false,
            //    },
            //    {
            //       name: 'VOTES',
            //       value: resultsOutput,
            //       inline: false,
            //    },
            //    {
            //       name: 'VOTERS',
            //       value: codeBlock(
            //          `Quorum: ${associatedPoll.voterQuorum}\n\nEligible: ${eligibleVoters}\nSubmitted: ${associatedPoll.countVoters}\nAbstained: ${associatedPoll.countAbstains}\n\nParticipation Rate: ${associatedPoll.participation}%`
            //       ),
            //       inline: false,
            //    },
            // ];

            updateEmbed.spliceFields(1, 4, closedFields);

            console.log('updateEmbed.fields');
            console.log(updateEmbed.fields);

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

            console.log('updateEmbed.fields');
            console.log(updateEmbed.fields);

            messageToUpdate.edit({
               content: null,
               embeds: [updateEmbed],
               components: [],
            });
         } else {
            console.log('updateEmbed => ', updateEmbed);

            try {
               messageToUpdate.edit({
                  content: mentions,
                  embeds: [updateEmbed],
               });

               console.log(messageToUpdate.embeds);
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
