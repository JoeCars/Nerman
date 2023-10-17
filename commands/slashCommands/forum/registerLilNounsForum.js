const { CommandInteraction } = require('discord.js');
const LilNounsProposalForum = require('../../../db/schemas/LilNounsProposalForum');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');
const { ObjectId } = require('mongodb');

module.exports = {
   subCommand: 'nerman.register-lilnouns-forum',
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
         forum = await LilNounsProposalForum.create({
            _id: new ObjectId(),
            guildId: interaction.guildId,
            channelId: forumChannel.id,
         });
      } catch (error) {
         Logger.error('commands/forum/registerLilNounsForum.js: Received error.', {
            error: error,
            guildId: interaction.guildId,
            channelId: forumChannel.id,
         });
         throw new Error(
            'Unable to register Lil Nouns forum due to a database error!',
         );
      }

      interaction.reply({
         content: `Successfully registered Lil Nouns forum.`,
         ephemeral: true,
      });
   },
};
