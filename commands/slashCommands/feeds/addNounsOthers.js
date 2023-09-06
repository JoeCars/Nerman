const add = require('./add');
module.exports = {
   subCommand: 'nerman-feeds.add.nouns-others',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      add.execute(interaction);
   },
};
