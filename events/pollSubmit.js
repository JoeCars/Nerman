const { drawBar, longestString } = require('../helpers/poll');
const { Modal } = require('discord-modals');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { Types } = require('mongoose');
const Poll = require('../db/schemas/Poll');
const PollChannel = require('../db/schemas/PollChannel');
const { logToObject, formatDate } = require('../utils/functions');

// const { create}

module.exports = {
   name: 'modalSubmit',
   /**
    * @param {Modal} modal
    */
   async execute(modal) {
      if (modal.customId !== 'modal-create-poll') return;

      console.log('pollSubmit.js -- modal', { modal });

      await modal.deferReply({ ephemeral: true });

      const {
         client,
         channelId,
         guildId,
         member: { nickname, user },
      } = modal;

      // console.log({ user });
      // console.log({ modal });

      // console.log({ client, modal });
      // extract data from submitted modal
      // const type = modal.getSelectMenuValues('pollType');
      const title = modal.getTextInputValue('pollTitle');
      const description = modal.getTextInputValue('pollDescription') ?? '';
      const options = modal
         .getTextInputValue('pollChoices')
         .split(',')
         .map(x => x.trim())
         .filter(v => v !== '');
      const voteAllowance =
         parseInt(modal.getTextInputValue('voteAllowance')) ?? 1;

      // ,, , Yes, No,Abstain,,, ,, , // <---- testing format string

      // console.log('OPTIONS.LENGTH ERROR');
      if (options.length < 2) {
         return modal.editReply({
            // return modal.update({
            // return modal.followUp({
            content:
               'You require a minimum of two options to vote. Use comma separated values to input choices. Eg) Yes, No, Abstain',
            ephemeral: true,
         });
      }

      // console.log('VOTEALLOWANCE > OPTIONS.LENGTH ERROR');
      if (voteAllowance > options.length) {
         return modal.editReply({
            content:
               'Currently we are unable to facilitate having more votes than options.',
            ephemeral: true,
         });
      }

      console.log({ options });

      // return modal.editReply({
      //    content: 'Aborting early for testing',
      //    ephemeral: true,
      // });

      // console.log(type);
      // This will change when I implement it in the actual nNouns Discord
      // const pollingChannelID =
      //    type === 'nouncil'
      //       ? process.env.POLL_CHAN_ID_DEV
      //       : process.env.POLL_CHAN_ID_DEV;

      // const pollingChannelID =
      //    type === 'nouncil'
      //       ? process.env.POLL_CHAN_ID_DEV
      //       : process.env.POLL_CHAN_ID_DEV;

      // const channel = client.channels.cache.get(pollingChannelID);
      const channel = client.channels.cache.get(channelId);

      const longestOption = longestString(options).length;
      let resultsArray = ['```', '```'];
      let resultsOutput = [];

      const barWidth = 8;
      let totalVotes = 0;

      let votesMap = new Map([
         ['maxLength', barWidth],
         ['totalVotes', totalVotes],
      ]);

      options.forEach(option => {
         const label = option;
         let optionObj = {
            label,
            votes: 0,
            room: longestOption - label.length,
            get spacer() {
               return this.room !== 0
                  ? Array.from({ length: this.room }, () => '\u200b ').join('')
                  : '';
            },
            get portion() {
               return votesMap.get('totalVotes') !== 0
                  ? this.votes / votesMap.get('totalVotes')
                  : 0;
            },
            get portionOutput() {
               return ` ${(this.portion * 100).toFixed(1)}%`;
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
      });

      // console.log(votesMap);

      resultsOutput = resultsArray.join('\n');

      const voteActionRow = new MessageActionRow();
      const voteBtn = new MessageButton()
         .setCustomId('vote')
         .setLabel('Vote')
         .setStyle('PRIMARY');

      const abstainBtn = new MessageButton()
         .setCustomId('abstain')
         .setLabel('Abstain')
         .setStyle('SECONDARY');

      voteActionRow.addComponents(voteBtn, abstainBtn);

      // Nerman
      // @member
      // VOTE:
      // title
      // description
      // voting closes in x time
      // RESULTS
      // historgram
      // maybe a timestamp?

      const embed = new MessageEmbed()
         .setColor('#ffffff')
         .setTitle(`VOTE \n${title}`)
         .setDescription(description)
         .addField('\u200B', '\u200B')
         .addField('Quorum', '1', true)
         .addField('Voters', '0', true)
         .addField('Abstains', '0', true)
         .addField('Voting Closes', '...', true)
         // .addField('Poll Results:', resultsOutput)
         // .setTimestamp()
         .setFooter('Submitted by ...');

      console.log(embed.fields[4].value);

      // const testDate = new Date().toISOString();
      // const testDate = new Date();
      // console.log({ testDate });

      // console.log(formatDate(testDate));
      // embed.fields[4].value = 'Hypothetical new time';
      // console.log(embed.fields[4].value);

      // console.log(modal.options);

      // return modal.editReply({
      //    content: 'Aborting early for testing',
      //    ephemeral: true,
      // });

      let message = await channel.send({
         embeds: [embed],
         components: [voteActionRow],
      });

      // console.log('HI THERRRRRREEEEEEE______________________________', {
      //    message,
      // });

      const { id } = message;
      // const { channelId, guildId, id } = message;

      console.log({ message });

      const pollData = {
         title,
         description,
         voteAllowance,
         choices: options,
      };

      const snapshotMap = new Map();

      // todo try to implement env for the allowed roles so that we can do this dynamically when hosting and using in other servers

      try {
         const allowedUsers = await message.guild.members
            .fetch({
               withPresences: true,
            })
            .then(fetchedMembers => {
               return fetchedMembers.filter(
                  member =>
                     member.presence?.status === 'online' &&
                     member?.roles.cache.get('919784986641575946')
               );
            });

         // console.log({ allowedUsers });

         for (const key of allowedUsers.keys()) {
            snapshotMap.set(key, false);
         }

         // console.log({ snapshotMap });

         // allowedUsers.forEach(user => )
      } catch (error) {
         console.error({ error });
      }

      const config = await PollChannel.findOne({ channelId }).exec();

      const { _id, durationMs } = await PollChannel.findOne({
         channelId,
      }).exec();

      console.log({ durationMs });

      // console.log({ _id, duration });

      // console.timeLog({ duration });

      const newPoll = await Poll.create({
         _id: new Types.ObjectId(),
         guildId,
         creatorId: user.id,
         messageId: id,
         config: config._id,
         pollData,
         votes: undefined,
         abstains: undefined,
         allowedUsers: snapshotMap,
         status: 'open',
      })
         .then(savedPoll => {
            // let updateEmbed = new MessageEmbed(message.embeds[0]);
            let updateEmbed = new MessageEmbed(embed);
            // console.log(savedPoll.timeCreated);
            // console.log(savedPoll.timeEnd);

            const timeEndMilli = new Date(
               // !testing switching the time for testing purposes
               // savedPoll.timeCreated.getTime() + durationMs

               savedPoll.timeCreated.getTime() + 30000
            );

            savedPoll.timeEnd = timeEndMilli.toISOString();
            console.log({ savedPoll });
            // console.log(formatDate(savedPoll.timeEnd));

            updateEmbed.setFooter(
               `Submitted by ${message.author.username}#${message.author.discriminator}`
            );

            // updateEmbed.setTimestamp(savedPoll.timeCreated);
            updateEmbed.fields[4].value = formatDate(savedPoll.timeEnd);

            console.log({ message });
            // console.log('post-calc', savedPoll.timeEnd instanceof Date);

            // console.log(savedPoll.timeCreated);
            // console.log(savedPoll.timeEnd);
            message.edit({ embeds: [updateEmbed] });
            return savedPoll.save();

            // Emit an event to trigger adding a new poll to the db poll interval queue
         })
         .catch(err => console.error(err));

      client.emit('queuePoll', await newPoll);

      return modal.editReply({
         content: 'Poll has been created!',
         ephemeral: true,
      });
   },
};
