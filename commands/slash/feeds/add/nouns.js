const add = require('./add');
module.exports = {
   subCommand: 'nerman-feeds.add.nouns',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      add.execute(interaction);
   },
};
