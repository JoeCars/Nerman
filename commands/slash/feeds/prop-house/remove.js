const remove = require('../subcommands/remove');

module.exports = {
   subCommand: 'prop-house.remove',

   async execute(interaction) {
      remove.execute(interaction);
   },
};
