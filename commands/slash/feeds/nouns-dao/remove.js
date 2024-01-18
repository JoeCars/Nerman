const remove = require('../subcommands/remove');

module.exports = {
   subCommand: 'nouns-dao.remove',

   async execute(interaction) {
      remove.execute(interaction);
   },
};
