const add = require('../subcommands/add');
module.exports = {
   subCommand: 'nerman-feeds.add.prop-house',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      add.execute(interaction);
   },
};
