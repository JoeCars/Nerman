const { CommandInteraction } = require('discord.js');
const { Types } = require('mongoose');
const User = require('../../../db/schemas/User');
const Poll = require('../../../db/schemas/Poll');
const PollChannel = require('../../../db/schemas/PollChannel');
const { log: l } = console;
// const { lc } = require('../../../utils/functions');
module.exports = {
   subCommand: 'nerman.participation',
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      const {
         channelId,
         channel: { name: channelName },
         guild: {
            members: { cache: mCache },
         },
         // user: { username, nickname, discriminator },
      } = interaction;

      // const config = await PollChannel.countDocuments({ channelId: channelId });
      l({ interaction });
      l({ channelName });
      // console.log({ config });
      const configExists = await PollChannel.configExists(channelId);

      if (!configExists) {
         // throw new Error('There are no configurations registered to this channel. You may only register from a channel in which polling has been configured.');
         return interaction.reply({
            content:
               'There are no configurations registered to this channel. You may only register from a channel in which polling has been configured.',
            ephemeral: true,
         });
      }

      // l({ mCache });

      const voterId = interaction.options.getString('discord-id');
      const voterDoc = await User.findOne().byDiscordId(voterId).exec();

      const {
         roles: { cache: memberRoles },
      } = await mCache.get(voterId);

      if (!voterDoc) {
         l('[...memberRoles.keys()]', [...memberRoles.keys()]);

         const hasVotingRole = await User.checkVotingRoles(memberRoles);

         console.log({ hasVotingRole });

         if (!hasVotingRole)
            throw new Error(
               'This member has no voting roles. Their participation can not be gauged, because they are unable to participate.'
            );

         const eligibleChannels = await User.findEligibleChannels(memberRoles);

         //disabled
         // const eligibleChannels = await PollChannel.find({
         //    allowedRoles: { $in: [...memberRoles.keys()] },
         // });

         l('CHUNGA', { eligibleChannels });

         // const channelMap = new Map();

         // for (const channel of eligibleChannels) {
         //    const polls = await Poll.aggregate([
         //       {
         //          $match: {
         //             [`config`]: channel._id,
         //             [`allowedUsers.${voterId}`]: { $exists: true },
         //          },
         //       },
         //    ]).exec();

         //    const statsObject = {
         //       eligiblePolls: polls.length,
         //       participatedPolls: polls.filter(
         //          ({ allowedUsers }) => allowedUsers[voterId] === true
         //       ).length,
         //    };

         //    l({ statsObject });

         //    channelMap.set(channel.channelId, statsObject);
         //    // const polls = await Poll.find({
         //    //    config: channel._id,
         //    //    allowedUsers: {$in}
         //    // }).exec();

         //    // allPolls = allPolls.concat(polls);
         // }

         // l({ channelMap });

         const newUser = await User.createUser(voterId, eligibleChannels);
         // const newUser = await new User({
         //    _id: new Types.ObjectId(),
         //    discordId: voterId,
         //    eligibleChannels: channelMap,
         // }).save();

         l({ newUser });

         // allPolls.


         const channelParticipation = await newUser.participation(channelId);

         // l({ allPolls });

         return interaction.reply({
            content: channelParticipation,
            ephemeral: true,
         });
      } else {
         const participation = await voterDoc.participation(channelId);

         interaction.reply({ content: participation, ephemeral: true });
      }

      // l({ voterId });
      // // l({ member });
      // // l(member.roles.cache);
      // // l({ memberRoles });
      // l([...memberRoles.keys()]);
      // l('MORBOOOOOOOOO');

      // // todo see if I can add this into one of the Schemas to make it reusable
      // const hasVotingRole = await PollChannel.countDocuments({
      //    allowedRoles: { $in: [...memberRoles.keys()] },
      // });

      // if (!hasVotingRole)
      //    throw new Error(
      //       'This member has no voting roles. There participation can not be gauged, because they are unable to participate.'
      //    );

      // l({ hasVotingRole });

      // l(mCache.get(voterId));

      // const voterDoc = await User.find().byDiscordId(voterId).exec();

      // if (!voterDoc.length) throw new Error('No users found');

      // l({ voterDoc });

      // return interaction.reply({ content: 'Aborting Early', ephemeral: true });

      // check user db to see if ther user already exists inside the collection

      // user.checkExists ?
      // 1) no - create user
      // 2) yes - retrieve participation

      // 1) create user:
      // > query all channelConfigs
      // > compare the the user roles against the allowedRoles from the channelConfigs
      // > store configs that mark user as voter
      // > query polls attached to stored configs and filter results for polls in which the target user was keyed into the allowedVoter map

      // wait wait, hold on... Let's see if it's possible to simply count the documents in which the user allowed to participate, and count the documents in which the user was not set as vote? This is becoming another optimization thing... dammit Time to get up in dem guts I see what hap(pen15) I guess
   },
};
