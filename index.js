// Require the necessary discord.js classes

const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require("./config.json");
const intents = new Intents(8); //ADMIN - remove and replace with real permissions later
let intentsALL = new Intents(Intents.ALL);
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_PRESENCES", "GUILD_EMOJIS_AND_STICKERS", "GUILD_MESSAGE_REACTIONS", "GUILD_WEBHOOKS"] });
const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};


//GUILD_MESSAGE_REACTIONS intent needed

// client.on('raw', async event => {
//    console.log("bean");
// 	// `event.t` is the raw event name
// 	if (!events.hasOwnProperty(event.t)) return;

// 	const { d: data } = event;
// 	//const user = client.users.get(data.user_id);
// 	const channel = client.channels.get(data.channel_id) || await user.createDM();

// 	// if the message is already in the cache, don't re-emit the event
// 	if (channel.messages.has(data.message_id)) return;

// 	// if you're on the master/v12 branch, use `channel.messages.fetch()`
// 	const message = await channel.fetchMessage(data.message_id);

// 	// custom emojis reactions are keyed in a `name:ID` format, while unicode emojis are keyed by names
// 	// if you're on the master/v12 branch, custom emojis reactions are keyed by their ID
// 	const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
// 	const reaction = message.reactions.get(emojiKey);
//    console.log(reaction);
//    console.log(emojiKey);
//    console.log('taco');

// 	client.emit(events[event.t], reaction, user);
// });

// client.on('messageReactionAdd', (reaction, user) => {
//    console.log("DING");

// });

// client.on('messageReactionRemove', (reaction, user) => {
//     console.log(`${user.username} removed their "${reaction.emoji.name}" reaction.`);
// });

// THIS WORKS
// client.on("message", function(message) {
//    console.log("doodoo");
//    if (message.author.bot) return;
//  });



client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
   const command = require(`./commands/${file}`);
   client.commands.set(command.data.name, command);
}



client.on('interactionCreate', async interaction => {
   if (!interaction.isCommand()) return;

   const command = client.commands.get(interaction.commandName);
   
   if (!command) return;

   try {
      await command.execute(interaction);
   } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
   }
});




const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
   const event = require(`./events/${file}`);
   if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
   } else {
      client.on(event.name, (...args) => event.execute(...args));
   }
}


// Login to Discord with your client's token
client.login(token);