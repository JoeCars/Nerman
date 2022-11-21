const { CommandInteraction } = require('discord.js');
const Poll = require('../../../db/schemas/Poll');
const PollChannel = require('../../../db/schemas/PollChannel');

const { initPollMessage } = require('../../../helpers/poll/initPollMessage');
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

      // Actually retrieve configuration
      const channelConfig = await PollChannel.findOne(
         { channelId },
         'allowedRoles maxUserProposal voteAllowance'
      ).exec();

      const messageId = interaction.options.getString('message-id');
      l({ messageId });
      const associatedPoll = await Poll.findOne()
         .byMessageId(messageId)
         .populate('config')
         .exec();

      l({ associatedPoll });
      if (associatedPoll === null)
         throw new Error('This message has no polls associated with it.');

      client
      const {
         creatorId,
         pollData: { title, description },
      } = associatedPoll;

      const messageToUpdate = await channel.messages.fetch(messageId);

      const messageObject = await initPollMessage({
         title,
         description,
         channelConfig,
         everyoneId,
      });

      let messageEmbed = messageObject.embeds[0];

      const {
         user: { username, nickname, discriminator },
      } = await memberCache.get(creatorId);

      messageEmbed.setFooter(
         `Poll #${associatedPoll.pollNumber} submitted by ${
            nickname ?? username
         }#${discriminator}`
      );

      let embedQuorum = Math.floor(
         associatedPoll.allowedUsers.size * (channelConfig.quorum / 100)
      );

      embedQuorum = embedQuorum > 1 ? embedQuorum : 1;

      messageEmbed.fields[1].value = embedQuorum.toString();

      messageEmbed.fields[4].value = `<t:${Math.floor(
         associatedPoll.timeEnd.getTime() / 1000
      )}:f>`;

      await messageToUpdate.edit(messageObject);
      interaction.editReply({ content: 'Regeneration finished!' });
   },
};
