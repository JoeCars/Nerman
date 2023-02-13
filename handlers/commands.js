const { Collection } = require('discord.js');
const { getFiles } = require('../utils/functions');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const importSON = require('../utils/StateOfNouns/importSON');
// todo use for permissions validation later on
// const { Perms } = require('../validation/permissions');
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const token = process.env.DISCORD_TOKEN;

module.exports = async client => {
   const Nouns = await importSON();
   // console.log(Nouns);
   const commandsArr = [];

   client.commands = new Collection();
   client.subCommands = new Collection();
   client.libraries = new Collection();

   client.libraries.set('Nouns', Nouns);

   const commands = await getFiles('commands', '.js');

   // console.log({ commands });

   if (commands.length === 0) throw 'No slash commands provided';

   commands.forEach(commandFile => {
      // const command = require(`../commands/${commandFile}`);
      // console.log({ commandFile });

      if (
         process.env.DEPLOY_STAGE !== 'development' &&
         commandFile === 'commands/reload-test.js'
      ) {
         console.log('RELOAD TEST', { commandFile });
         return;
      }

      const command = require(`../${commandFile}`);

      if (command.subCommand) {
         return client.subCommands.set(command.subCommand, command);
      }

      // console.log({ command });

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

   // console.log(commandsArr);
   // commandsArr.forEach(cmd => {
   //    console.log(cmd);
   //    cmd.options.forEach(option => {
   //       console.log(option);
   //       console.log(option.testAttribute);
   //    });
   // });

   const rest = new REST({ version: '9' }).setToken(token);

   (async () => {
      try {
         console.log('Attemping to register application commands...');

         await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: [],
         });

         await rest.put(Routes.applicationCommands(clientId), {
            body: commandsArr,
         });

         console.log('Successfully registered application commands! :D');
      } catch (error) {
         console.log(error);
      }
   })();
};
