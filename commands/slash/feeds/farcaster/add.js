const add = require('../subcommands/add');

module.exports = {
   subCommand: 'farcaster.add',

   async execute(interaction) {
      add.execute(interaction);
   },
};
