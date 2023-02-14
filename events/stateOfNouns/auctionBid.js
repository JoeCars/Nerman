const { MessageEmbed, Channel } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');

const { log: l } = console;

module.exports = {
   name: 'auctionBid',
   /**
    *
    * @param {Channel} genChannel
    */
   async execute(genChannel, data) {
      try {
         l('AUCTION BID EVENT HANDLER');

         const {
            id,
            amount,
            extended,
            bidder: { id: bidderId },
         } = data;

         const Nouns = genChannel.client.libraries.get('Nouns');

         // l({ genChannel });
         l({ data });
         l({ id, amount, extended, bidderId });



         const bidderENS = await Nouns.ensReverseLookup(bidderId);
         const ethBaseUrl = 'https://etherscan.io/address/';

         const bidderLink = hyperlink(bidderENS, `${ethBaseUrl}${bidderId}`);

         const bidEmbed = new MessageEmbed()
            .setColor('#00FFFF')
            .setTitle(`Auction Bid`)
            .setDescription(`${bidderLink} bid ${amount}Ξ on Noun ${id}`);

         return await genChannel.send({ embeds: [bidEmbed] });
      } catch (error) {
         console.error(error);
      }
   },
};
