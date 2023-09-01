const add = require('./add');
module.exports = {
   subCommand: 'nerman-feeds.add.nouns-dao-auctions',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      add.execute(interaction);
   },
};
