const remove = require('../subcommands/remove');

module.exports = {
   subCommand: 'polls.remove',

   async execute(interaction) {
      remove.execute(interaction);
   },
};
