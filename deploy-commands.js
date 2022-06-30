const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { getFiles, logToObject } = require('./utils/functions');
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const token = process.env.DISCORD_TOKEN;

const commands = [];
// const commandFiles = fs
//    .readdirSync('./commands')
// .filter(file => file.endsWith('.js'));
const commandFiles = getFiles('./commands', '.js');

for (const file of commandFiles) {
   const command = require(`./commands/${file}`);
   console.log(`DEPLOY-COMMANDS.JS -- ${logToObject(command)}`);
   commands.push(command.data.toJSON());
}

console.log(`COMMANDS -- \n ${commands}`);

const rest = new REST({ version: '9' }).setToken(token);

// rest
// 	.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
// 	.then(() => console.log('Successfully registered application commands.'))
// 	.catch(console.error);

(async () => {
   try {
      console.log('Attemping to register application commands...');

      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
         body: commands,
      });

      console.log('Successfully registered application commands! :D');
   } catch (error) {
      console.log(error);
   }
})();
