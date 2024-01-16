const add = require('../subcommands/add');

module.exports = {
   subCommand: 'federation.add',

   async execute(interaction) {
      add.execute(interaction);
   },
};
