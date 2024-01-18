const remove = require('../subcommands/remove');

module.exports = {
   subCommand: 'propdates.remove',

   async execute(interaction) {
      remove.execute(interaction);
   },
};
