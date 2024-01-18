const remove = require('../subcommands/remove');

module.exports = {
   subCommand: 'prophouse.remove',

   async execute(interaction) {
      remove.execute(interaction);
   },
};
