const { CommandInteraction } = require('discord.js');
const add = require('./add');
const PollChannel = require('../../../../db/schemas/PollChannel');

module.exports = {
   subCommand: 'nerman-feeds.add.polls',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      const channel =
         interaction.options.getChannel('channel') ?? interaction.channel;
      const numOfChannels = await PollChannel.countDocuments({
         channelId: channel.id,
      }).exec();

      if (numOfChannels === 0) {
         return interaction.reply({
            content:
               'This feed can only be added to poll channels. Please create a poll channel first.',
            ephemeral: true,
         });
      }

      add.execute(interaction);
   },
};
