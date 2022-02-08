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

// const events = {
// 	MESSAGE_REACTION_ADD: 'messageReactionAdd',
// 	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
// };

if (process.env.DISCORD_DEPLOY_COMMANDS == 'true') {
   require('./deploy-commands.js');
   console.log('Hello!');
}

client.commands = new Collection();

const commandFiles = fs
   .readdirSync('./commands')
   .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
   const command = require(`./commands/${file}`);
   client.commands.set(command.data.name, command);
}

const eventFiles = fs
   .readdirSync('./events')
   .filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
   const event = require(`./events/${file}`);
   if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
   } else {
      client.on(event.name, (...args) => event.execute(...args));
   }
}

client.on('shardError', error => {
   console.error('A websocket connection encountered an error:', error);
});

process.on('unhandledRejection', error => {
   console.error('Unhandled promise rejection:', error);
});

process.on('warning', console.warn);

// Login to Discord with your client's token
client.login(token);
