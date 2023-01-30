const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { Modal } = require('discord-modals');
const { Types } = require('mongoose');
const { roleMention } = require('@discordjs/builders');
const { initPollMessage } = require('../../helpers/poll/initPollMessage');
const User = require('../../db/schemas/User');
const Poll = require('../../db/schemas/Poll');
const PollChannel = require('../../db/schemas/PollChannel');
const PollCount = require('../../db/schemas/ChannelPollCount');

const { log: l } = console;
const { drawBar, longestString } = require('../../helpers/poll');
const { logToObject, formatDate } = require('../../utils/functions');

// const { create}

module.exports = {
   name: 'modalSubmit',
   /**
    * @param {Modal} modal
    */
   async execute(modal) {
      if (modal.customId !== 'modal-create-poll') return;

      // console.log('pollSubmit.js -- modal', { modal });

      await modal.deferReply();

      const {
         client,
         channelId,
         guildId,
         guild: {
            members: { cache: memberCache },
            roles: {
               everyone: { id: everyoneId },
            },
         },
         member: {
            nickname,
            user,
            user: { username, discriminator },
         },
      } = modal;

      console.log({ modal });

      const channelConfig = await PollChannel.findOne(
         {
            channelId,
         },
         'allowedRoles'
      );

      const intRegex = new RegExp(/^\d*$/);

      console.log({ everyoneId });
      console.log(channelConfig.allowedRoles);

      // return modal.editReply({
      //    content: 'ABORT',
      //    ephemeral: true,
      // });

      // extract data from submitted modal
      const title = modal.getTextInputValue('pollTitle');
      const description = modal.getTextInputValue('pollDescription') ?? '';
      const options = [
         ...new Set(
            modal
               .getTextInputValue('pollChoices')
               .split(',')
               .map(x => x.trim().toLowerCase())
               .filter(v => v !== '')
         ),
      ];
      let voteAllowance = parseInt(
         modal.getTextInputValue('voteAllowance') ?? 1
      );

      console.log({ options });
      console.log({ voteAllowance });

      // return modal.editReply({ content: 'Return early', ephemeral: true });

      if (!intRegex.test(voteAllowance)) {
         return modal.editReply({
            content: `${voteAllowance} - is not a valid vote allowance number.\nPlease choose a whole number.`,
            ephemeral: true,
         });
      }

      // console.log('merp');

      // let voteAllowance = parseInt(
      //    modal.getTextInputValue('voteAllowance') ?? 1
      // );

      // console.log({ voteAllowance });
      // console.log(typeof voteAllowance);

      // ,, , Yes, No,Abstain,,, ,, , // <---- testing format string

      if (options.length < 2) {
         return modal.editReply({
            content:
               'You require a minimum of two options to vote. Use comma separated values to input choices. Eg) Yes, No, Abstain',
            ephemeral: true,
         });
      }

      if (voteAllowance > options.length) {
         return modal.editReply({
            content:
               'Currently we are unable to facilitate having more votes than options.',
            ephemeral: true,
         });
      }

      // console.log({ options });

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

      //disabled vvvvvv disabling this bar output for the live voting until we decide how best to manage this later
      // const longestOption = longestString(options).length;
      // let resultsArray = ['```', '```'];
      // let resultsOutput = [];

      // const barWidth = 8;
      // let totalVotes = 0;

      // let votesMap = new Map([
      //    ['maxLength', barWidth],
      //    ['totalVotes', totalVotes],
      // ]);

      // options.forEach(option => {
      //    const label = option;
      //    let optionObj = {
      //       label,
      //       votes: 0,
      //       room: longestOption - label.length,
      //       get spacer() {
      //          return this.room !== 0
      //             ? Array.from({ length: this.room }, () => '\u200b ').join('')
      //             : '';
      //       },
      //       get portion() {
      //          return votesMap.get('totalVotes') !== 0
      //             ? this.votes / votesMap.get('totalVotes')
      //             : 0;
      //       },
      //       get portionOutput() {
      //          return ` ${(this.portion * 100).toFixed(1)}%`;
      //       },
      //       get bar() {
      //          return drawBar(votesMap.get('maxLength'), this.portion);
      //       },
      //       get completeBar() {
      //          return [
      //             `${this.label}${this.spacer} `,
      //             this.bar,
      //             this.portionOutput,
      //          ].join('');
      //       },
      //    };

      //    votesMap.set(label, optionObj);
      //    resultsArray.splice(-1, 0, optionObj.completeBar);
      // });

      // console.log(votesMap);
      // resultsOutput = resultsArray.join('\n');

      // disabled ^^^^^^^^^^

      const messageObject = await initPollMessage({
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

      // const voteActionRow = new MessageActionRow();
      // const voteBtn = new MessageButton()
      //    .setCustomId('vote')
      //    .setLabel('Vote')
      //    .setStyle('PRIMARY');

      // const abstainBtn = new MessageButton()
      //    .setCustomId('abstain')
      //    .setLabel('Abstain')
      //    .setStyle('SECONDARY');

      // voteActionRow.addComponents(voteBtn, abstainBtn);

      // const embed = new MessageEmbed()
      //    .setColor('#ffffff')
      //    .setTitle(`${title}`)
      //    .setDescription(description)
      //    .addField('\u200B', '\u200B')
      //    .addField('Quorum', '...', true)
      //    .addField('Voters', '0', true)
      //    .addField('Abstains', '0', true)
      //    .addField('Voting Closes', '...', true)
      //    // .addField('Poll Results:', resultsOutput)
      //    // .setTimestamp()
      //    .setFooter('Submitted by ...');

      // const mentions = channelConfig.allowedRoles
      //    .map(role => (role !== everyoneId ? roleMention(role) : '@everyone'))
      //    .join(' ');

      // console.log({ mentions });
      console.log({ messageObject });
      let message;
      try {
         message = await channel.send(messageObject);
      } catch (error) {
         console.log({ error });
         await modal.deleteReply({
            content: '',
            ephemeral: true,
         });

         await modal.followUp({
            content:
               'Nerman does not have access to posting in this channel, despite channel configurations. Have you checked to see if Nerman has been added to this channel?',
            ephemeral: true,
         });
      }

      // let message = await channel.send({
      //    content: mentions,
      //    embeds: [embed],
      //    components: [voteActionRow],
      // });

      const { id } = message;
      // const { channelId, guildId, id } = message;

      // console.log({ message });

      const pollData = {
         title,
         description,
         voteAllowance,
         choices: options,
      };

      const snapshotMap = new Map();
      const eligibleKeys = [];

      // todo try to implement env for the allowed roles so that we can do this dynamically when hosting and using in other servers
      // todo also this should be done via fetching the config
      try {
         const allowedUsers = await message.guild.members
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
                  //disabled not worrying about the
                  // return (
                  //    member.presence?.status === 'online' &&
                  //    !member.user.bot &&
                  //    member?.roles.cache.hasAny(...channelConfig.allowedRoles)
                  // );
               });
            });

         for (const key of allowedUsers.keys()) {
            snapshotMap.set(key, false);
            eligibleKeys.push(key);
         }

         console.log({ eligibleKeys });
      } catch (error) {
         console.error({ error });
      }

      console.log({ eligibleKeys });

      // todo decide if I really need this or can just stick with the use-case below
      // const config = await PollChannel.findOne({ channelId }).exec();

      //
      const { _id, durationMs, quorum } = await PollChannel.findOne({
         channelId,
      }).exec();

      const countExists = await PollCount.checkExists(channelId);

      console.log({ countExists });

      let pollNumber;

      if (!countExists) {
         console.log('Count does not exist');
         pollNumber = await PollCount.createCount(channelId);
      } else {
         console.log('Count exists');
         pollNumber = await PollCount.findOne({ channelId }).exec();
      }

      // console.log({ pollNumber });

      // console.log({ durationMs });

      try {
         // todo refactor this to use {new: true} and return the document perhaps, rather than this two part operation?
         console.group('Create Poll Attributes');
         console.log({ guildId });
         console.log(user.id);
         console.log({ _id });
         console.log({ id });
         console.log({ pollData });
         console.groupEnd('Create Poll Attributes');

         const data = {
            _id: new Types.ObjectId(),
            guildId,
            creatorId: user.id,
            messageId: id,
            // config: config._id,
            config: _id,
            pollData,
            votes: undefined,
            abstains: undefined,
            allowedUsers: snapshotMap,
            status: 'open',
            pollNumber: undefined,
         };

         const newPoll = await (await Poll.createNewPoll(data, durationMs))
            .populate('config')
            .then(async poll => {
               console.log('WITHIN THE THEN', { poll });
               await pollNumber.increment();
               poll.pollNumber = pollNumber.pollsCreated;
               return await poll.save();
            });

         // await newPoll.populate('pollNumber');
         console.log('OUTSIDE THE THEN', { newPoll });

         // todo Make this updating eligible users channel map into a reusable function

         const updateVoterPromise = [...newPoll.allowedUsers.keys()].map(
            async key => {
               l({ key });

               // todo I need to add in a proper check for if these people exist
               let user = await User.findOne().byDiscordId(key).exec();

               if (user === null) {
                  const member = memberCache.get(key);
                  // l('MISSING USER', { member });
                  // l(member.roles.cache);
                  const memberRoles = member.roles.cache;
                  const eligibleChannels = await User.findEligibleChannels(
                     memberRoles
                  );
                  // l('ERIGIBIRU FROM POLLSUBMIT', await eligibleChannels);
                  user = await User.createUser(key, eligibleChannels);
               }

               l('this is the new user', { user });

               // l(user.eligibleChannels);

               // l(newPoll);
               // mystery ID 383705280174620704
               // doppelnouncil 1017403835913863260

               l(user.eligibleChannels.get(newPoll.config.channelId));
               // const newEligibility = user.eligibleChannels.get(
               //    newPoll.config.channelId
               // );
               // l({ newEligibility });
               // newEligibility.eligiblePolls++;
               // l({ newEligibility });
               // l(user);

               // user.eligibleChannels.set
               // user.markModified('eligibleChannels');
               // return await user.save();
               // l({ participation });
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
            newPoll.allowedUsers.size * (quorum / 100)
         );

         embedQuorum = embedQuorum > 1 ? embedQuorum : 1;

         updatedEmbed.fields[1].value = embedQuorum.toString(); // quorum

         updatedEmbed.fields[4].value = `<t:${Math.floor(
            newPoll.timeEnd.getTime() / 1000
         )}:f>`; // timeEnd

         const threadName =
            title.length <= 100 ? title : `${title.substring(0, 96)}...`;
         
         client.emit('enqueuePoll', newPoll);
         await message.edit({ embeds: [updatedEmbed] });
         await message.startThread({
            name: threadName,
            autoArchiveDuration: 10080, // todo probably make this based on channelConfig?
         });

         await message.thread.send(`Discussion:`);

         console.log({ message });
         console.log(message.thread);
      } catch (error) {
         console.error(error);
      }

      // const newPoll = await Poll.create({
      //    _id: new Types.ObjectId(),
      //    guildId,
      //    creatorId: user.id,
      //    messageId: id,
      //    // config: config._id,
      //    config: _id,
      //    pollData,
      //    votes: undefined,
      //    abstains: undefined,
      //    allowedUsers: snapshotMap,
      //    status: 'open',
      // })
      //    .then(savedPoll => {
      //       // savedPoll = savedPoll.populate('config').exec();
      //       let updateEmbed = new MessageEmbed(embed);
      //       console.log({ savedPoll });

      //       const timeEndMilli = new Date(
      //          savedPoll.timeCreated.getTime() + durationMs

      //          // !testing switching the time for testing purposes
      //          // savedPoll.timeCreated.getTime() + 30000
      //       );

      //       savedPoll.timeEnd = timeEndMilli.toISOString();

      //       updateEmbed.setFooter(
      //          `Submitted by ${nickname ?? username}#${discriminator}`
      //          // `Submitted by ${message.author.username}#${message.author.discriminator}`
      //       );

      //       // updateEmbed.fields[1].value = savedPoll.voterQuorum; // quorum
      //       let embedQuorum = Math.floor(
      //          savedPoll.allowedUsers.size * (quorum / 100)
      //       );

      //       embedQuorum = embedQuorum > 1 ? embedQuorum : 1;

      //       updateEmbed.fields[1].value = embedQuorum.toString(); // quorum
      //       // updateEmbed.fields[1].value = Math.floor(
      //       //    savedPoll.allowedUsers.size * (quorum / 100)
      //       // ).toString(); // quorum
      //       // updateEmbed.fields[4].value = formatDate(savedPoll.timeEnd); // timeEnd

      //       //todo Maybe switch this to a Poll.create({...},{new: true}) then modify approach
      //       updateEmbed.fields[4].value = `<t:${Math.floor(
      //          savedPoll.timeEnd.getTime() / 1000
      //       )}:f>`; // timeEnd

      //       message.edit({ embeds: [updateEmbed] });
      //       return savedPoll.save();
      //    })
      //    .catch(err => console.error(err));

      // Emit an event to trigger adding a new poll to the db poll interval queue

      // const reply = await modal.editReply({

      // todo add button vomponents in AFTER initial DB commit of the poll
      return await modal.deleteReply({
         content: 'Poll Submitted!',
      });
   },
};
