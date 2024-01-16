const add = require('../subcommands/add');

module.exports = {
   subCommand: 'propdates.add',

   async execute(interaction) {
      add.execute(interaction);
   },
};
