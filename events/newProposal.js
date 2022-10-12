const { MessageEmbed, MessageButton, MessageActionRow, Message } = require('discord.js');
const { roleMention } = require('@discordjs/builders');
const { Types } = require('mongoose');
const PollChannel = require('../db/schemas/PollChannel');
const Poll = require('../db/schemas/Poll');
const { logToObject } = require('../utils/functions');
const { log: l } = console;

const propChannelId =
   process.env.DEPLOY_STAGE === 'staging'
      ? process.env.TESTNERMAN_NOUNCIL_CHAN_ID
      : process.env.DEVNERMAN_NOUNCIL_CHAN_ID;

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
      const titleRegex = new RegExp(
         /^(\#\s((\w|[0-9_\-.,\|])+\s+)+(\w+\s?\n?))/
      );
      // const titleRegex = new RegExp(/^(\#\s(\w+\s)+--\s(\w+\s)+(\w+\s+\n?))/);
      const title = desc.match(titleRegex)[0].replaceAll(/^(#\s)|(\n+)$/g, '');
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

      // extract data from submitted modal

      // !testing vvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
      // const title = modal.getTextInputValue('pollTitle');
      // const description = modal.getTextInputValue('pollDescription') ?? '';
      // const options = [
      // ...new Set(
      // modal
      // .getTextInputValue('pollChoices')
      // .split(',')
      // .map(x => x.trim().toLowerCase())
      // .filter(v => v !== '')
      // ),
      // ];
      // let voteAllowance = parseInt(
      // modal.getTextInputValue('voteAllowance') ?? 1
      // );
      // !testing ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

      // console.log({ options });
      // console.log({ voteAllowance });

      // return modal.editReply({ content: 'Return early', ephemeral: true });

      // if (!intRegex.test(voteAllowance)) {
      //    return modal.editReply({
      //       content: `${voteAllowance} - is not a valid vote allowance number.\nPlease choose a whole number.`,
      //       ephemeral: true,
      //    });
      // }

      // if (options.length < 2) {
      //    return modal.editReply({
      //       content:
      //          'You require a minimum of two options to vote. Use comma separated values to input choices. Eg) Yes, No, Abstain',
      //       ephemeral: true,
      //    });
      // }

      // if (voteAllowance > options.length) {
      //    return modal.editReply({
      //       content:
      //          'Currently we are unable to facilitate having more votes than options.',
      //       ephemeral: true,
      //    });
      // }

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

      const embed = new MessageEmbed()
         .setColor('#ffffff')
         .setTitle(`${title}`)
         .setDescription(description)
         .addField('\u200B', '\u200B')
         .addField('Quorum', '...', true)
         .addField('Voters', '0', true)
         .addField('Abstains', '0', true)
         .addField('Voting Closes', '...', true)
         // .addField('Poll Results:', resultsOutput)
         // .setTimestamp()
         .setFooter('Submitted by ...');

      const mentions = channelConfig.allowedRoles
         .map(role => (role !== everyoneId ? roleMention(role) : '@everyone'))
         .join(' ');

      console.log({ mentions });

      // let message = await propChannel.send({
      // content: mentions,
      // embeds: [embed],
      // components: [voteActionRow],
      // });

      const pollData = {
         title,
         description,
         voteAllowance: 1,
         choices: ['yes', 'no', 'abstain'],
      };

      const snapshotMap = new Map();

      // todo try to implement env for the allowed roles so that we can do this dynamically when hosting and using in other servers
      // todo also this should be done via fetching the config
      try {
         // const allowedUsers = await message.guild.members
         const allowedUsers = await interaction.guild.members
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

      // todo decide if I really need this or can just stick with the use-case below
      // const config = await PollChannel.findOne({ channelId }).exec();

      //
      // const { _id, durationMs, quorum } = await PollChannel.findOne({
      //    channelId,
      // }).exec();

      // console.log({ durationMs });

      // console.log({ _id, duration });

      // console.timeLog({ duration });

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

         const newPoll = await Poll.createNewPoll(
            data,
            channelConfig.durationMs
         );
         // const newPoll = await Poll.create(
         //    [
         //       {
         //          _id: new Types.ObjectId(),
         //          guildId,
         //          creatorId: user.id,
         //          messageId: id,
         //          // config: config._id,
         //          config: _id,
         //          pollData,
         //          votes: undefined,
         //          abstains: undefined,
         //          allowedUsers: snapshotMap,
         //          status: 'open',
         //       },
         //    ],

         //    { new: true }
         // ).then(docArray => docArray[0]);

         console.log({ newPoll });
         let updatedEmbed = new MessageEmbed(embed);

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
            `Submitted by ${nickname ?? username}#${discriminator}`
         );

         let embedQuorum = Math.floor(
            newPoll.allowedUsers.size * (channelConfig.quorum / 100)
         );

         embedQuorum = embedQuorum > 1 ? embedQuorum : 1;

         updatedEmbed.fields[1].value = embedQuorum.toString(); // quorum

         updatedEmbed.fields[4].value = `<t:${Math.floor(
            newPoll.timeEnd.getTime() / 1000
         )}:f>`; // timeEnd

         interaction.edit({
            content: mentions,
            embeds: [updatedEmbed],
            components: [voteActionRow],
         });

         client.emit('enqueuePoll', newPoll);
      } catch (error) {
         // console.log('BIG FAT FUCKN ERROR, BRUH');
         console.error(error);
      }

      // todo refactor this to use {new: true} and return the document perhaps, rather than this two part operation?
      // const newPoll = await Poll.create({
      //    _id: new Types.ObjectId(),
      //    guildId,
      //    creatorId: user.id,
      //    // messageId: message.id,
      //    messageId: interaction.id,
      //    // config: config._id,
      //    config: channelConfig._id,
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
      //       l({ channelConfig });
      //       l(channelConfig.duration);
      //       l(
      //          'channelConfig.durationMs--------------------',
      //          channelConfig.durationMs
      //       );

      //       const timeEndMilli = new Date(
      //          savedPoll.timeCreated.getTime() + channelConfig.durationMs

      //          // !testing switching the time for testing purposes
      //          // savedPoll.timeCreated.getTime() + 30000
      //       );

      //       l({ timeEndMilli });

      //       savedPoll.timeEnd = timeEndMilli.toISOString();

      //       updateEmbed.setFooter(
      //          `Submitted by ${nickname ?? username}#${discriminator}`
      //          // `Submitted by ${message.author.username}#${message.author.discriminator}`
      //       );

      //       // updateEmbed.fields[1].value = savedPoll.voterQuorum; // quorum
      //       let embedQuorum = Math.floor(
      //          savedPoll.allowedUsers.size * (channelConfig.quorum / 100)
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

      //       // message.edit({ embeds: [updateEmbed] });
      //       interaction.edit({
      //          content: mentions,
      //          embeds: [updateEmbed],
      //          components: [voteActionRow],
      //       });
      //       return savedPoll.save();
      //    })
      //    .catch(err => console.error(err));

      // Emit an event to trigger adding a new poll to the db poll interval queue
      // client.emit('enqueuePoll', newPoll);

      // propChannel.send({
      //    content: 'This emission of an artifical prop has been received!',
      // });

      // return interaction.edit({
      //    content: 'Event newProposal processed',
      //    // ephemeral: true,
      // });
   },
};