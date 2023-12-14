const add = require('./add');
module.exports = {
   subCommand: 'nerman-feeds.add.lil-nouns',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      add.execute(interaction);
   },
};
