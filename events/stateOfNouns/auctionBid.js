const { MessageEmbed, Channel } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');

const shortenAddress = require('../../helpers/nouns/shortenAddress');

const { log: l } = console;

module.exports = {
   name: 'auctionBid',
   /**
    *
    * @param {Channel} auctionChannel
    */
   async execute(auctionChannel, data) {
      try {
         l('AUCTION BID EVENT HANDLER');

         const {
            id,
            amount,
            extended,
            bidder: { id: bidderId },
         } = data;

         const Nouns = auctionChannel.client.libraries.get('Nouns');

         l({ data });
         l({ id, amount, extended, bidderId });

         const bigNumString = amount.toString();

         const bidderENS =
            (await Nouns.ensReverseLookup(bidderId)) ??
            (await shortenAddress(bidderId));
         const ethBaseUrl = 'https://etherscan.io/address/';

         const bidderLink = hyperlink(bidderENS, `${ethBaseUrl}${bidderId}`);

         const nounsLink = hyperlink(
            `Noun ${id}`,
            `https://nouns.wtf/noun/${id}`
         );

         const amountNew = Number(
            bigNumString.slice(0, -18) + '.' + bigNumString.slice(-18)
         );

         const bidEmbed = new MessageEmbed()
            .setColor('#00FFFF')
            .setTitle(`Auction Bid`)
            .setDescription(`${bidderLink} bid ${amountNew}Ξ on ${nounsLink}`);

         return await auctionChannel.send({ embeds: [bidEmbed] });
      } catch (error) {
         console.error(error);
      }
   },
};
