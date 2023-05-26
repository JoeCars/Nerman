const { Collection } = require('discord.js');
// todo can use for cvlaidation later on, not right now though
// const { Events } = require('../validation/eventNames');
const { getFiles } = require('../utils/functions');

module.exports = async (client, reload) => {
   // const { client } = nerman;
   client.events = new Collection();

   // console.log('LOGGING EVENTS')
   // console.log(Events)

   let eventFiles = await getFiles('events', '.js');
   // let eventFiles = await getFiles('../events', '.js');

   if (eventFiles.length === 0) {
      console.log(`No event files to load.`);
      throw `No event files to load.`;
   }

   eventFiles.forEach(file => {
      try {
         console.log({ file });
         if (reload) delete require.cache[require.resolve(file)];
         // if (reload) delete require.cache[require.resolve(`../events/${file}`)];

         // const event = require(`../events/${file}`);
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
      } catch (error) {
         console.log(error);
      }
   });
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
