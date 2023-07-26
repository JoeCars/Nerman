const { CommandInteraction } = require('discord.js');
const Logger = require('../../../helpers/logger');
const { isUserAuthorized } = require('../../../helpers/authorization');

const DEFAULT_IS_DOXED = false;
const DEFAULT_TITLE = 'The Rabbit Hole';
const DEFAULT_IS_REPLY = false;
const DEFAULT_POST_ID =
   '0x0b7a60408bf4ac733205c837d8f70a9932550cb230dad15e60064a9d4cdac723';
const DEFAULT_USER_ID =
   'Percy-81721f3625a62ab421fac6ff2369f8572ff06f7973480c4a0f3077a99d7eea93';
const DEFAULT_POST_BODY =
   'Reply to replies only. The good conversations start 100 replies deep.';

module.exports = {
   subCommand: 'nerman-trigger.new-noun-nymz-post',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      const guildUser = await interaction.guild.members.fetch(
         interaction.user.id,
      );
      if (!(await isUserAuthorized(4, guildUser))) {
         throw new Error('This is an admin-only command');
      }

      // post.doxed
      const isDoxed =
         interaction.options.getBoolean('is-doxed') ?? DEFAULT_IS_DOXED;
      // post.root.title or post.title
      const title =
         interaction.options.getString('post-title') ?? DEFAULT_TITLE;
      const isReply =
         interaction.options.getBoolean('is-reply') ?? DEFAULT_IS_REPLY;
      // post.id
      const postId =
         interaction.options.getString('post-id') ?? DEFAULT_POST_ID;
      // post.userId
      const userId =
         interaction.options.getString('user-id') ?? DEFAULT_USER_ID;
      // post.body
      const postBody =
         interaction.options.getString('body') ?? DEFAULT_POST_BODY;

      const nymz = interaction.client.libraries.get('NounsNymz');
      nymz.trigger('NewPost', {
         doxed: isDoxed,
         title: isReply ? '' : title,
         root: isReply ? { title: title } : undefined,
         id: postId,
         userId: userId,
         body: postBody,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a new noun nymz post event.',
      });

      Logger.info(
         'commands/trigger/newPost.js: A new noun nymz post event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
