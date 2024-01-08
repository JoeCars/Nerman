const add = require('../add');
module.exports = {
   subCommand: 'nerman-feeds.add.polls',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      add.execute(interaction);
   },
};
