const { MessageAttachment } = require('discord.js');

async function fetchNouner(endpoint, includeDelegates) {
   let address = `https://noun.pics/${endpoint}`;

   if (includeDelegates) {
      address += `?includeDelegates=${includeDelegates}`;
   }

   const data = {
      content_type: `image/png`,
      ephemeral: false,
   };

   const attachment = new MessageAttachment(
      address,
      `nouner-tile-${endpoint}.png`,
      data,
   );

   return attachment;
}

module.exports.fetchNouner = fetchNouner;
