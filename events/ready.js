module.exports = {
   name: 'ready',
   once: true,
   execute(client) {
      console.log(`Ready! Logged in as ${client.user.tag}`);
      // client.channels.cache.get('919783277726957603').send('gm :coffee:');
   },
};