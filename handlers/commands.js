const { Collection, REST, Routes } = require('discord.js');

const { getFiles } = require('../utils/functions');
const importNermanJS = require('../utils/nouns/importNerman');
const Logger = require('../helpers/logger');

const clientId = process.env.DISCORD_CLIENT_ID;
const token = process.env.DISCORD_TOKEN;

module.exports = async client => {
   Logger.info('handlers/commands.js: Handling commands.');

   const Nouns = await importNermanJS();

   const commandsArr = [];

   client.commands = new Collection();
   client.subCommands = new Collection();
   client.libraries = new Collection();

   client.libraries.set('Nouns', Nouns);

   const commands = await getFiles('commands', '.js');

   if (commands.length === 0) throw 'No slash commands provided';

   commands.forEach(commandFile => {
      const command = require(`../${commandFile}`);

      if (command.subCommand) {
         return client.subCommands.set(command.subCommand, command);
      } else if (command.name) {
         return client.commands.set(command.name, command);
      } else if (command.data.name && typeof command.data.name === 'string') {
         commandsArr.push(command.data.toJSON());
         client.commands.set(command.data.name, command);
      } else {
         throw new Error(
            `${commandFile} failed to load because it does not have a name.`,
         );
      }
   });

   const rest = new REST({ version: '9' }).setToken(token);

   (async () => {
      try {
         Logger.info(
            'handlers/commands.js: Attempting to register application commands.',
         );
         await rest.put(Routes.applicationCommands(clientId), {
            body: commandsArr,
         });

         Logger.info(
            'handlers/commands.js: Successfully registered application commands! :D',
         );
      } catch (error) {
         Logger.error('handlers/commands.js: Received an error.', {
            error: error,
         });
      }
   })();
};
