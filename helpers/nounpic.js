const { MessageAttachment } = require('discord.js');

async function fetchNouner(endpoint, includeDelegates) {
   let address = `https://noun.pics/${endpoint}`;

   if (includeDelegates) {
      address += `?includeDelegates=${includeDelegates}`;
   }

   const data = {
      content_type: `image/png`,
      ephemeral: true,
   };

   const attachment = new MessageAttachment(
      address,
      `nouner-tile-${endpoint}.png`,
      data
   );

   return attachment;
}

module.exports.fetchNouner = async function (endpoint, includeDelegates) {
   return fetchNouner(endpoint, includeDelegates);
};
