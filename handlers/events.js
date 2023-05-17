const { Collection } = require('discord.js');
// todo can use for cvlaidation later on, not right now though
// const { Events } = require('../validation/eventNames');
const { getFiles } = require('../utils/functions');
const Logger = require('../helpers/logger');

module.exports = async (client, reload) => {
   Logger.info('handlers/events.js: Beginning to register events.');

   client.events = new Collection();

   let eventFiles = await getFiles('events', '.js');

   if (eventFiles.length === 0) {
      Logger.debug('handlers/events.js: No event files to load.', {
         numOfFiles: eventFiles.length,
      });
      throw `No event files to load.`;
   }

   eventFiles.forEach(file => {
      Logger.debug('handlers/events.js: Checking files.', {
         numOfFiles: eventFiles.length,
         file: file,
      });

      if (reload) delete require.cache[require.resolve(file)];

      const event = require(`../${file}`);

      // if (!Events.includes)
      // client.events.set(event.name, event);

      //    if (!reload)
      //       console.log(`The event: ${file} loaded`)
      //       initEvents(nerman);

      if (event.name && typeof event.name === 'string') {
         client.events.set(event.name, event);
      } else {
         throw new TypeError(
            `The event: ${file} failed to load because it doesn't have a name property`
         );
      }
      if (event.once) {
         client.once(event.name, (...args) => event.execute(...args));
      } else {
         client.on(event.name, (...args) => event.execute(...args));
      }
   });

   Logger.info('handlers/events.js: Finished registering events.');
};

// function triggerEventHandler(nerman, event, ...args) {
//    const { client } = nerman;

//    try {
//       if (client.events.has(event)) {
//          client.events.get(event).execute(nerman, ...args);
//       } else {
//          throw new Error(`Event named: ${event}, does not exist.`);
//       }
//    } catch (error) {
//       console.error(error);
//    }
// }

// function initEvents(nerman) {
//    const { client } = nerman;

//    client.on('ready', () => {
//       triggerEventHandler(nerman, 'ready');
//    });
// }
