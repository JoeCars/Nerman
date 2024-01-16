const remove = require('../subcommands/remove');

module.exports = {
   subCommand: 'federation.remove',

   async execute(interaction) {
      remove.execute(interaction);
   },
};
