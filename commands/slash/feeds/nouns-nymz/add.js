const add = require('../subcommands/add');

module.exports = {
   subCommand: 'nouns-nymz.add',

   async execute(interaction) {
      add.execute(interaction);
   },
};
