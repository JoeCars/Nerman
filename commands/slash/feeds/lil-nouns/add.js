const add = require('../subcommands/add');

module.exports = {
   subCommand: 'lil-nouns.add',

   async execute(interaction) {
      add.execute(interaction);
   },
};
