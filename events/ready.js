module.exports = {
   name: 'ready',
   once: true,
   async execute(client) {
      console.log(
         `Ready! Logged in as ${client.user.tag}: ` + process.env.NODE_ENV
      );

      // Initialize StateOfNouns, Add Event Listeners
      const StateOfNouns = require('../helpers/StateOfNoun.js');
      StateOfNouns.addEventListener( "new-proposal", function(data) {
         console.log("| ready.js - callback - new-proposal - Prop "+ data.id);
      });
   },
};