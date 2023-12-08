const { SlashCommandBuilder } = require('@discordjs/builders');

const Logger = require('../../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-nouns-nymz')
      .setDescription('Trigger a Nouns Nymz event.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('new-post')
            .setDescription('Trigger a new Nouns Nymz post event.')
            .addBooleanOption(option => {
               return option
                  .setName('is-doxed')
                  .setDescription('Set whether the user is doxed or not.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('post-title')
                  .setDescription('The post title.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addBooleanOption(option => {
               return option
                  .setName('is-reply')
                  .setDescription(
                     'Set whether the post is a reply or an original post.',
                  )
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('post-id')
                  .setDescription('The post id.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('user-id')
                  .setDescription('The user id.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('body')
                  .setDescription('The body of the post.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            });
      }),

   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute() {
      Logger.info(
         'commands/trigger-nouns-nymz.js: Executed Nerman trigger command.',
      );
   },
};
