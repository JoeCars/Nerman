const add = require('../subcommands/add');
module.exports = {
   subCommand: 'nerman-feeds.add.nouns-nymz',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      add.execute(interaction);
   },
};
