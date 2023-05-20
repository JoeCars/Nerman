const { Collection } = require('discord.js');
const { getFiles } = require('../utils/functions');
const Logger = require('../helpers/logger');

module.exports = async client => {
   Logger.info('handlers/button.js: Handling buttons.');

   // const buttonsArr = [];
   client.buttons = new Collection();

   const buttons = await getFiles('buttons', '.js');

   if (buttons.length === 0) throw 'No buttons provided';

   buttons.forEach(button => {
      // const buttonFile = require(`../buttons/${button}`);
      const buttonFile = require(`../${button}`);

      if (buttonFile.id) {
         client.buttons.set(buttonFile.id, buttonFile);
      } else {
         throw new TypeError(
            `The event: ${buttonFile} failed to load because it doesn't have an ID property`
         );
      }
   });

   Logger.info('handlers/button.js: Finished handling buttons.');
};
