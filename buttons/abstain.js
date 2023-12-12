const { ButtonInteraction, EmbedBuilder } = require('discord.js');
const User = require('../db/schemas/User');
const Poll = require('../db/schemas/Poll');
const PollChannel = require('../db/schemas/PollChannel');
const Logger = require('../helpers/logger');
const { checkUserEligibility } = require('../helpers/buttonEligibility');

module.exports = {
   id: 'abstain',
   /**
    *
    * @param {ButtonInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'buttons/abstain.js: Attempting to press the abstain button.',
         {
            userId: interaction.user.id,
            guildId: interaction.guild.id,
            channelId: interaction.channelId,
            messageId: interaction.message.id,
         },
      );

      if (!interaction.isButton()) return;

      await interaction.deferReply({ ephemeral: true });

      const {
         client,
         channelId,
         guild: { id: guildId },
         message: { id: messageId },
         user: { id: userId },
         member: {
            roles: { cache: roleCache },
         },
      } = interaction;

      const { allowedRoles, anonymous: anon } = await PollChannel.findOne(
         { channelId },
         'allowedRoles',
      ).exec();

      const pollStatus = await Poll.findOne(
         { messageId },
         'status allowedUsers',
      );

      const eligibility = await checkUserEligibility(
         roleCache,
         allowedRoles,
         pollStatus,
         userId,
         interaction.member.joinedTimestamp,
      );

      if (!eligibility.isEligible) {
         return interaction.editReply({
            content: eligibility.message,
            ephemeral: true,
         });
      }

      let abstainingUser = await User.findOne()
         .byDiscordId(userId, guildId)
         .exec();

      if (!abstainingUser) {
         abstainingUser = await createAbstainingUser(
            roleCache,
            anon,
            guildId,
            userId,
         );
      }

      const updatedPoll = await Poll.findAndSetAbstained(messageId, userId);
      abstainingUser.incParticipation(channelId);

      await updateVoteEmbed(client, channelId, messageId, updatedPoll);

      await interaction.editReply({
         content: 'You have chosen to abstain from this poll',
         ephemeral: true,
      });

      Logger.info(
         'buttons/abstain.js: Successfully pressed the abstain button.',
         {
            userId: interaction.user.id,
            guildId: interaction.guild.id,
            channelId: interaction.channelId,
            messageId: interaction.message.id,
         },
      );
   },
};

async function createAbstainingUser(roleCache, anon, guildId, userId) {
   const eligibleChannels = await User.findEligibleChannels(roleCache, anon);
   return User.createUser(guildId, userId, eligibleChannels);
}

async function updateVoteEmbed(client, channelId, messageId, updatedPoll) {
   // TODO: Update the results portion of the embed to include the new abstain.

   let message = await client.channels.cache
      .get(channelId)
      .messages.fetch(messageId);

   const updateEmbed = new EmbedBuilder(message.embeds[0]);

   updateEmbed.spliceFields(
      updateEmbed.fields.findIndex(({ name }) => name === 'Abstains'),
      1,
      {
         name: 'Abstains',
         value: `${updatedPoll.countAbstains}`,
         inline: true,
      },
   );

   // NOTE: This is just to fix open polls without Voting Closes fields
   // todo remove later when I find out the specific root of this issue
   if (!updateEmbed.fields.find(({ name }) => name === 'Voting Closes')) {
      updateEmbed.spliceFields(
         updateEmbed.fields.findIndex(({ name }) => name === 'Abstains') + 1,
         0,
         {
            name: 'Voting Closes',
            value: `<t:${Math.floor(updatedPoll.timeEnd.getTime() / 1000)}:f>`,
            inline: false,
         },
      );
   }

   message.edit({ embeds: [updateEmbed] });
}
