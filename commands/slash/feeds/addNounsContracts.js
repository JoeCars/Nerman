const add = require('./add');
module.exports = {
   subCommand: 'nerman-feeds.add.nouns-contracts',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      add.execute(interaction);
   },
};
