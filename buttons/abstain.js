const { ButtonInteraction, MessageEmbed } = require('discord.js');
const Poll = require('../db/schemas/Poll');
const PollChannel = require('../db/schemas/PollChannel');

module.exports = {
   id: 'abstain',
   /**
    *
    * @param {ButtonInteraction} interaction
    */
   async execute(interaction) {
      if (!interaction.isButton()) return;

      await interaction.deferReply({ ephemeral: true });

      const {
         client,
         channelId,
         message: { id: messageId },
         user: { id: userId },
         member: {
            roles: { cache: roleCache },
         },
      } = interaction;

      const { allowedRoles } = await PollChannel.findOne(
         { channelId },
         'allowedRoles'
      ).exec();

      if (!roleCache.hasAny(...allowedRoles)) {
         console.log('USER DOES NOT HAS ROLE');
         return interaction.editReply({
            content: 'You do not have the role, dummy',
            ephemeral: true,
         });
      }

      const pollStatus = await Poll.findOne(
         { messageId },
         'status allowedUsers'
      );

      // if (!attachedPoll.allowedUsers.has(userId)) {
      if (!pollStatus.allowedUsers.has(userId)) {
         return interaction.editReply({
            content: 'You are not eligible to participate in this poll, square',
            ephemeral: true,
         });
      }

      // enabled disabled for testing
      // if (attachedPoll.allowedUsers.get(userId) === true) {
      if (pollStatus.allowedUsers.get(userId) === true) {
         return interaction.reply({
            content: 'You have already cast your vote, you political glutton',
            ephemeral: true,
         });
      }

      const updatedPoll = await Poll.findOneAndUpdate(
         { messageId },
         {
            $set: {
               [`allowedUsers.${userId}`]: true,
               [`abstains.${userId}`]: true,
            },
         },
         { new: true }
      ).exec();

      let message = await client.channels.cache
         .get(channelId)
         .messages.fetch(messageId);

      const updateEmbed = new MessageEmbed(message.embeds[0]);

      updateEmbed.spliceFields(
         updateEmbed.fields.findIndex(({ name }) => name === 'Abstains'),
         1,
         {
            name: 'Abstains',
            value: `${updatedPoll.countAbstains}`,
            inline: true,
         }
      );

      message.edit({ embeds: [updateEmbed] });

      return await interaction.editReply({
         content: 'You have chosen to abstain from this poll',
         ephemeral: true,
      });
   },
};
