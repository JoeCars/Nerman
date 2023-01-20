const {
   CommandInteraction,
   MessageEmbed,
   EmbedBuilder,
} = require('discord.js');
const { roleMention } = require('@discordjs/builders');

const Poll = require('../../../db/schemas/Poll');
const PollChannel = require('../../../db/schemas/PollChannel');

const { initPollMessage } = require('../../../helpers/poll/initPollMessage');
const { drawBar, longestString } = require('../../../helpers/poll');

const { log: l } = console;

const guildAdminId = process.env.NERMAN_G_ADMIN_ID;
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
         guild: {
            members: { cache: memberCache },
            roles: {
               everyone: { id: everyoneId },
            },
         },
         member: {
            roles: { cache: roleCache },
         },
      } = interaction;

      await interaction.deferReply({ ephemeral: true });

      // if (!(await PollChannel.countDocuments({ channelId }))) {
      if (!roleCache.has(guildAdminId))
         throw new Error('This is an admin-only command');

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
         'allowedRoles maxUserProposal voteAllowance quorum'
      ).exec();

      const messageId = interaction.options.getString('message-id');
      const embedOnly = interaction.options.getBoolean('embed-only');
      const noChannelMessage =
         interaction.options.getBoolean('no-original-message') ?? false;

      l({ noChannelMessage });
      l({ messageId });
      const associatedPoll = await Poll.findOne()
         .byMessageId(messageId)
         .populate('config')
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

         messageEmbed.fields[1].value = embedQuorum.toString();
         // l('MESSAGE EMBED WITH QUORUM TOO?!\n', messageEmbed);

         messageEmbed.fields[4].value = `<t:${Math.floor(
            associatedPoll.timeEnd.getTime() / 1000
         )}:f>`;

         messageObject.embeds[0] = messageEmbed;

         l('MESSAGE EMBED AND AN END TIME WHADDAFUK\n', messageEmbed);
         l('MESSAGE OBJECT\n', messageObject);

         const newMsg = await channel.send(messageObject);
         await newMsg.startThread({
            name: associatedPoll.pollData.title,
            autoArchiveDuration: 60,
         });
         l({ messageToUpdate });
         l({ newMsg });
         associatedPoll.messageId = newMsg.id;
         associatedPoll.save();

         if (noChannelMessage === false) {
            messageToUpdate.delete();
         }
      } else {
         const updateEmbed = new MessageEmbed(messageToUpdate.embeds[0]);
         const embedTitle = associatedPoll.pollData.title;

         const mentions = await channelConfig.allowedRoles
            .map(role =>
               role !== everyoneId ? roleMention(role) : '@everyone'
            )
            .join(' ');

         updateEmbed.setTitle(embedTitle);

         let embedQuorum = Math.floor(
            associatedPoll.allowedUsers.size * (channelConfig.quorum / 100)
         );

         embedQuorum = embedQuorum > 1 ? embedQuorum : 1;

         updateEmbed.fields[1].value = embedQuorum.toString();

         updateEmbed.fields[4].value = `<t:${Math.floor(
            associatedPoll.timeEnd.getTime() / 1000
         )}:f>`;

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

            const longestOption = longestString(
               associatedPoll.pollData.choices
            ).length;
            let resultsArray = ['```', '```'];
            let resultsOutput = [];

            const barWidth = 8;
            let totalVotes = associatedPoll.results.totalVotes;

            let votesMap = new Map([
               ['maxLength', barWidth],
               ['totalVotes', totalVotes],
            ]);
            for (const key in results.distribution) {
               const label = key[0].toUpperCase() + key.substring(1);
               let optionObj = {
                  label,
                  votes: results.distribution[key],
                  room: longestOption - label.length,
                  get spacer() {
                     return this.room !== 0
                        ? Array.from(
                             { length: this.room },
                             () => '\u200b '
                          ).join('')
                        : '';
                  },
                  get portion() {
                     return votesMap.get('totalVotes') !== 0
                        ? this.votes / votesMap.get('totalVotes')
                        : 0;
                  },
                  get portionOutput() {
                     // return ` ${(this.portion * 100).toFixed(1)}%`;
                     return ` ${this.votes ?? 0} votes`;
                  },
                  get bar() {
                     return drawBar(votesMap.get('maxLength'), this.portion);
                  },
                  get completeBar() {
                     return [
                        `${this.label}${this.spacer} `,
                        this.bar,
                        this.portionOutput,
                     ].join('');
                  },
               };

               votesMap.set(label, optionObj);
               resultsArray.splice(-1, 0, optionObj.completeBar);
            }

            resultsOutput = resultsArray.join('\n');

            // let closedEmbed = message.embeds[0];
            // console.log({ closedEmbed });

            // closedEmbed.setTitle(`${closedEmbed.title}`);

            // console.log({ closedEmbed });

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
                  value: codeBlock(
                     `Quorum: ${associatedPoll.voterQuorum}\n\nEligible: ${eligibleVoters}\nSubmitted: ${associatedPoll.countVoters}\nAbstained: ${associatedPoll.countAbstains}\n\nParticipation Rate: ${associatedPoll.participation}%`
                  ),
                  inline: false,
               },
            ];

            updateEmbed.spliceFields(1, 4, closedFields);

            console.log('closedEmbed.fields');
            console.log(closedEmbed.fields);

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

            console.log('closedEmbed.fields');
            console.log(closedEmbed.fields);

            messageToUpdate.edit({
               content: mentions,
               embeds: [updateEmbed],
               components: [],
            });
         } else {
            messageToUpdate.edit({
               content: mentions,
               embeds: [updateEmbed],
            });
         }

         // todo make sure I can regenerate if closed
      }
      await interaction.editReply({ content: 'Regeneration finished!' });
   },
};
