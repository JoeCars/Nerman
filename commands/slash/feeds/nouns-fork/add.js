const add = require('../subcommands/add');

module.exports = {
   subCommand: 'nouns-fork.add',

   async execute(interaction) {
      add.execute(interaction);
   },
};
