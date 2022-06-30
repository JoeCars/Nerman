// const fs = require('fs');
const { Collection } = require('discord.js');
const { getFiles } = require('../utils/functions');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
// use for permissions validation later on
const { Perms } = require('../validation/permissions');
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const token = process.env.DISCORD_TOKEN;

module.exports = async client => {
   const commandsArr = [];
   client.commands = new Collection();
   // const commandFiles = fs
   //    .readdirSync('./commands')
   //    .filter(file => file.endsWith('.js'));

   const commands = getFiles('./commands', '.js');

   if (commands.length === 0) throw 'No slash commands provided';

   // for (const file of commandFiles) {
   //    const command = require(`./commands/${file}`);
   //    commands.push(command.data.toJSON());
   // }

   commands.forEach(commandFile => {
      const command = require(`../commands/${commandFile}`);
      // console.log(command.data);
      // console.log(command.data.name);
      if (command.data.name && typeof command.data.name === 'string') {
         commandsArr.push(command.data.toJSON());
         client.commands.set(command.data.name, command);
      } else {
         throw new TypeError(
            [
               `The slash command: ${commandFile} failed to load`,
               "because it doesn't have a name property`",
            ].join(' ')
         );
      }

   });

   const rest = new REST({ version: '9' }).setToken(token);

   // rest
   // 	.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
   // 	.then(() => console.log('Successfully registered application commands.'))
   // 	.catch(console.error);

   (async () => {
      try {
         console.log('Attemping to register application commands...');

         await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commandsArr,
         });

         console.log('Successfully registered application commands! :D');
      } catch (error) {
         console.log(error);
      }
   })();
};
