const remove = require('../subcommands/remove');

module.exports = {
   subCommand: 'nouns-fork.remove',

   async execute(interaction) {
      remove.execute(interaction);
   },
};
