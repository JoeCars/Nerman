const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const NounsCandidateForum = require('../../../db/schemas/NounsCandidateForum');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');
const { ObjectId } = require('mongodb');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('register-candidate-forum')
      .setDescription('Register a candidate forum.')
      .addChannelOption(option => {
         return option
            .setName('forum-channel')
            .setDescription('The channel designated as a candidate forum.')
            .setRequired(true);
      }),
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 3);

      const forumChannel = interaction.options.getChannel('forum-channel');

      if (!forumChannel) {
         throw new Error('No channel provided!');
      }

      let forum = undefined;
      try {
         forum = await NounsCandidateForum.create({
            _id: new ObjectId(),
            guildId: interaction.guildId,
            channelId: forumChannel.id,
         });
      } catch (error) {
         Logger.error(
            'commands/forum/registerCandidateForum.js: Received error.',
            {
               error: error,
               guildId: interaction.guildId,
               channelId: forumChannel.id,
            },
         );
         throw new Error(
            'Unable to register candidate forum due to a database error!',
         );
      }

      interaction.reply({
         content: `Successfully registered candidate forum.`,
         ephemeral: true,
      });
   },
};
