const add = require('./add');
module.exports = {
   subCommand: 'nerman-feeds.add.federation',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      add.execute(interaction);
   },
};
