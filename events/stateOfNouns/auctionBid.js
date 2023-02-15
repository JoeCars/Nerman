const { MessageEmbed, Channel } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');

const shortenAddress = require('../../helpers/nouns/shortenAddress');

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

         l('Number(amount) => ', Number(amount));

         const bidderENS = await (Nouns.ensReverseLookup(bidderId) ??
            shortenAddress(bidderId));
         const ethBaseUrl = 'https://etherscan.io/address/';

         const bidderLink = hyperlink(bidderENS, `${ethBaseUrl}${bidderId}`);

         const amountNew = Number(
            amount.slice(0, -18) + '.' + amount.slice(-18)
         );

         const bidEmbed = new MessageEmbed()
            .setColor('#00FFFF')
            .setTitle(`Auction Bid`)
            .setDescription(`${bidderLink} bid ${amountNew}Ξ on Noun ${id}`);

         return await genChannel.send({ embeds: [bidEmbed] });
      } catch (error) {
         console.error(error);
      }
   },
};
