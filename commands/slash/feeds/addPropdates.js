const add = require('./add');
module.exports = {
   subCommand: 'nerman-feeds.add.propdates',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      add.execute(interaction);
   },
};
