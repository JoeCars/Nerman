const add = require('../subcommands/add');
module.exports = {
   subCommand: 'nerman-feeds.add.nouns-fork',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      add.execute(interaction);
   },
};
