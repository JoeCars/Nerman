const add = require('../subcommands/add');

module.exports = {
   subCommand: 'nouns-dao.add',

   async execute(interaction) {
      add.execute(interaction);
   },
};
