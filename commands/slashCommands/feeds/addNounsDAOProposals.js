const add = require('./add');
module.exports = {
   subCommand: 'nerman-feeds.add.nouns-dao-proposals',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      add.execute(interaction);
   },
};
