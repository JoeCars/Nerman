const add = require('./add');
module.exports = {
   subCommand: 'nerman-feeds.add.nerman-poll',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      add.execute(interaction);
   },
};
