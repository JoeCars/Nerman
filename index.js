require('dotenv').config();
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const token = process.env.DISCORD_TOKEN;

const client = new Client({
   intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_PRESENCES,
      Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.GUILD_WEBHOOKS,
   ],
});
const discordModals = require('discord-modals');
discordModals(client);

// const events = {
// 	MESSAGE_REACTION_ADD: 'messageReactionAdd',
// 	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
// };

// client.commands = new Collection();
// if (process.env.DISCORD_DEPLOY_COMMANDS == 'true') {
//    require('./handlers/commands.js')(client);
//    console.log('Commands Deployed!');
// }
// require('./handlers/events.js')(client, (reload = false));
// console.log('Events Deployed');

['events', 'commands', 'buttons'].forEach(handler =>
   require(`./handlers/${handler}.js`)(client, (reload = false))
);

// const commandFiles = fs
//    .readdirSync('./commands')
//    .filter(file => file.endsWith('.js'));

// for (const file of commandFiles) {
//    const command = require(`./commands/${file}`);
//    console.log(`INDEX.JS -- ${command}`)
//    client.commands.set(command.data.name, command);
// }

// const eventFiles = fs
//    .readdirSync('./events')
//    .filter(file => file.endsWith('.js'));

// for (const file of eventFiles) {
//    const event = require(`./events/${file}`);
//    if (event.once) {
//       client.once(event.name, (...args) => event.execute(...args));
//    } else {
//       client.on(event.name, (...args) => event.execute(...args));
//    }
// }

client.on('shardError', error => {
   console.error('A websocket connection encountered an error:', error);
});

process.on('unhandledRejection', error => {
   console.error('Unhandled promise rejection:', error);
});

process.on('warning', console.warn);

// Login to Discord with your client's token
client.login(token);
