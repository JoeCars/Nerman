const remove = require('../subcommands/remove');

module.exports = {
   subCommand: 'nouns-nymz.remove',

   async execute(interaction) {
      remove.execute(interaction);
   },
};
