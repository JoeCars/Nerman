module.exports = {
   name: 'ready',
   once: true,
   async execute(client) {
      console.log(
         `Ready! Logged in as ${client.user.tag}: ` + process.env.NODE_ENV
      );


      require('../db/index.js')(client);
   },
};
