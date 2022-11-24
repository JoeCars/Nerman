const {
   CommandInteraction,
   MessageEmbed,
   EmbedBuilder,
} = require('discord.js');
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

      // todo add in logic to check if the document already has existing vote entries and regenerate the message to reflect those votes
      // todo also add in logic to check to see if the poll is closed, and if so, make sure the message is not regenerated as an open poll, or just error out the command perhaps so that it can not be used on closed polls

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

      const {
         // client,
         creatorId,
         pollData: { title, description },
      } = associatedPoll;

      const messageToUpdate = await channel.messages.fetch(messageId);

      l({ messageToUpdate });

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

      let embedQuorum = Math.floor(
         associatedPoll.allowedUsers.size * (channelConfig.quorum / 100)
      );

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
      l({ messageToUpdate });
      l({newMsg});
      associatedPoll.messageId = newMsg.id;
      associatedPoll.save();

      messageToUpdate.delete();
      await interaction.editReply({ content: 'Regeneration finished!' });
   },
};
