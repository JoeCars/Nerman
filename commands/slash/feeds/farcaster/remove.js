const remove = require('../subcommands/remove');

module.exports = {
   subCommand: 'farcaster.remove',

   async execute(interaction) {
      remove.execute(interaction);
   },
};
