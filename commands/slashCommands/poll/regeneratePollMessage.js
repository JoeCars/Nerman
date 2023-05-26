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

const { log: l } = console;

// fixme change this once we have a better way of nailing down the guild's admin permissions
const authorizedIds = process.env.BAD_BITCHES.split(',');
module.exports = {
   subCommand: 'nerman.regenerate-poll-message',
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
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

      if (!authorizedIds.includes(userId)) {
         l('NO USER ID');
         throw new Error('You do not have permission to access this command.');
      }

      // return await interaction.editReply({ content: 'TEST END' });

      // todo maybe convert this over to access the config from the guildConfigs collection within Nerman -- going to wait on migratiung these over for now, only sticking to using it this way where I need it, until I can account for new error/security issues in this method
      const configExists = await PollChannel.configExists(channelId);

      console.log('CREATE', { configExists });

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
         'allowedRoles maxUserProposal voteAllowance quorum liveVisualFeed'
      ).exec();

      const messageId = interaction.options.getString('message-id');
      const embedOnly = interaction.options.getBoolean('embed-only');
      const noChannelMessage =
         interaction.options.getBoolean('no-original-message') ?? false;

      l({ noChannelMessage });
      l({ messageId });
      const associatedPoll = await Poll.findOne()
         .byMessageId(messageId)
         .populate([
            { path: 'config' },
            { path: 'countVoters' },
            { path: 'getVotes' },
         ])
         .exec();

      l({ associatedPoll });
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

         l({ messageToUpdate });
      }

      if (!embedOnly) {
         let messageObject = await initPollMessage({
            title,
            description,
            channelConfig,
            everyoneId,
         });

         // l('MESSAGE OBJECT\n', messageObject);

         let messageEmbed = messageObject.embeds[0];

         l('MESSAGE EMBED\n', messageEmbed);

         const {
            nickname,
            user: { username, discriminator },
         } = await memberCache.get(creatorId);

         l({ username, nickname, discriminator });

         messageEmbed.setFooter(
            `Poll #${associatedPoll.pollNumber} submitted by ${
               nickname ?? username
            }#${discriminator}`
         );

         // l('MESSAGE EMBED WITH FOOTER WOW\n', messageEmbed);

         let embedQuorum = await Math.floor(
            associatedPoll.allowedUsers.size * (channelConfig.quorum / 100)
         );

         l({ channelConfig });
         l({ embedQuorum });

         embedQuorum = embedQuorum > 1 ? embedQuorum : 1;

         // messageEmbed.fields[1].value = embedQuorum.toString();
         messageEmbed.fields.find(({ name }) => name === 'Quorum').value =
            embedQuorum.toString();
         // l('MESSAGE EMBED WITH QUORUM TOO?!\n', messageEmbed);

         // messageEmbed.fields[4].value = `<t:${Math.floor(
         //    associatedPoll.timeEnd.getTime() / 1000
         // )}:f>`;
         messageEmbed.fields.find(
            ({ name }) => name === 'Voting Closes'
         ).value = `<t:${Math.floor(
            associatedPoll.timeEnd.getTime() / 1000
         )}:f>`;

         messageObject.embeds[0] = messageEmbed;

         l('MESSAGE EMBED AND AN END TIME WHADDAFUK\n', messageEmbed);
         l('MESSAGE OBJECT\n', messageObject);

         const threadName =
            associatedPoll.pollData.title.length <= 100
               ? associatedPoll.pollData.title
               : `${associatedPoll.pollData.title.substring(0, 96)}...`;

         const newMsg = await channel.send(messageObject);
         await newMsg.startThread({
            name: threadName,
            autoArchiveDuration: 10080, // todo probably make this based on channelConfig?
         });
         l({ messageToUpdate });
         l({ newMsg });
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
               role !== everyoneId ? roleMention(role) : '@everyone'
            )
            .join(' ');

         // disabled for meow
         // updateEmbed.setTitle(embedTitle);

         let embedQuorum = Math.floor(
            associatedPoll.allowedUsers.size * (channelConfig.quorum / 100)
         );

         console.log(
            'messageToUpdate?.embeds[0].description => ',
            messageToUpdate.embeds[0]?.description
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
                  associatedPoll.timeEnd.getTime() / 1000
               )}:f>`,
               inline: false,
            },
         ];

         if (associatedPoll.config.liveVisualFeed === true) {
            const embedResults =
               messageToUpdate.embeds[0]?.fields.find(
                  ({ name }) => name === 'Results'
               ).value ?? 'WEEEE';

            newEmbedFields.splice(1, 0, {
               name: 'Results',
               value: embedResults,
               inline: false,
            });
         }

         console.log('newEmbedFields => ', newEmbedFields);

         console.log(
            'messageToUpdate?.embeds[0].footer => ',
            messageToUpdate.embeds[0]?.footer
         );

         console.log(
            'messageToUpdate?.embeds[0].footer.text => ',
            messageToUpdate.embeds[0]?.footer.text
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
               failedChecks
            );

            if (results.quorumPass === false) {
               failedChecks.push('quorum');
            }

            if (results.thresholdPass === false) {
               failedChecks.push('vote threshold');
            }

            console.log(
               'nerman/admin/regeneratePollMessages.js -- jsfailedChecks after checks=> ',
               failedChecks
            );

            console.log(
               'admin/regeneratePollMessage.js -- associatedPoll.pollSucceeded PRE checks => ',
               associatedPoll.pollSucceeded
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
               associatedPoll.pollData.choices
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

               // let optionObj = {
               //    label,
               //    votes: results.distribution[key],
               //    room: longestOption - label.length,
               //    get spacer() {
               //       return this.room !== 0
               //          ? Array.from(
               //               { length: this.room },
               //               () => '\u200b '
               //            ).join('')
               //          : '';
               //    },
               //    get portion() {
               //       return votesMap.get('totalVotes') !== 0
               //          ? this.votes / votesMap.get('totalVotes')
               //          : 0;
               //    },
               //    get portionOutput() {
               //       // return ` ${(this.portion * 100).toFixed(1)}%`;
               //       return ` ${this.votes ?? 0} votes`;
               //    },
               //    get bar() {
               //       return drawBar(votesMap.get('maxLength'), this.portion);
               //    },
               //    get completeBar() {
               //       return [
               //          `${this.label}${this.spacer} `,
               //          this.bar,
               //          this.portionOutput,
               //       ].join('');
               //    },
               // };

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

            l(
               'admin/regeneratePollMessage.js -- associatedPoll.countVoters =>',
               associatedPoll.countVoters
            );
            l(
               'admin/regeneratePollMessage.js -- associatedPoll.countAbstains =>',
               associatedPoll.countAbstains
            );

            l('admin/regeneratePollMessage.js -- updateEmbed =>', updateEmbed);
            l(
               'admin/regeneratePollMessage.js -- updateEmbed.fields =>',
               updateEmbed.fields
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
                  // embeds: [updateEmbed],
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
   },
};
