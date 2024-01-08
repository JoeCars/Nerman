const add = require('../subcommands/add');
module.exports = {
   subCommand: 'nerman-feeds.add.nouns',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      add.execute(interaction);
   },
};
