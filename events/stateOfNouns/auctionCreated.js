const { MessageEmbed, Channel } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');

const Logger = require('../../helpers/logger');

module.exports = {
   name: 'auctionCreated',
   /**
    *
    * @param {Channel} genChannel
    */
   async execute(genChannel, data) {
      try {
         Logger.info(
            'events/stateOfNouns/auctionCreated.js: Attempting to handle an auction creation event.',
            {
               id: data.id,
               startTime: data.startTime,
               endTime: data.endTime,
               channelId: genChannel.id,
            }
         );

         const { id, startTime, endTime } = data;

         const nounsWTF = hyperlink(
            'Nouns.wtf',
            `https://nouns.wtf/noun/${id}`
         );
         const pronouns = hyperlink(
            'Pronouns.gg',
            `https://pronouns.gg/noun/${id}`
         );
         const nounOClock = hyperlink(
            'Nounoclock.app',
            `https://www.nounoclock.app/`
         );

         const acEmbed = new MessageEmbed()
            .setColor('#00FFFF')
            .setTitle(`New Auction | Noun ${id}`)
            .setDescription(`${nounsWTF}\n${pronouns}\n${nounOClock}`)
            .setImage(`https://noun.pics/${id}.png`);

         Logger.info(
            'events/stateOfNouns/auctionCreated.js: Successfully handled an auction creation event.',
            {
               id: data.id,
               startTime: data.startTime,
               endTime: data.endTime,
               channelId: genChannel.id,
            }
         );

         return await genChannel.send({ embeds: [acEmbed] });
      } catch (error) {
         Logger.info(
            'events/stateOfNouns/auctionCreated.js: Received an error.',
            {
               error: error,
            }
         );
      }
   },
};
