module.exports = {
   name: 'ready',
   once: true,
   async execute(client) {
      console.log(
         `Ready! Logged in as ${client.user.tag}: ` + process.env.NODE_ENV
      );

      require('../db/index.js')(client);
      require('../utils/remindSheet.js')(client);
      // Initialize StateOfNouns, Add Event Listeners
      const StateOfNouns = require('../helpers/StateOfNoun.js');

      StateOfNouns.addEventListener('new-proposal', function (data) {
         console.log('| ready.js - callback - new-proposal - Prop ' + data.id);
         console.log(
            '| ready.js - callback - new-proposal - Prop \n' + data.description
         );
         // pm on tis callback we message nouncil-votes with the title and prop #
         // add click on this vote button or square [vote / abstain mimic]
      });
   },
};
