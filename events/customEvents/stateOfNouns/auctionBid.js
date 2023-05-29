const { MessageEmbed, Channel } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');

const shortenAddress = require('../../../helpers/nouns/shortenAddress');
const Logger = require('../../../helpers/logger');

module.exports = {
   name: 'auctionBid',
   /**
    *
    * @param {Channel} auctionChannel
    */
   async execute(auctionChannel, data) {
      try {
         Logger.info(
            'events/stateOfNouns/auctionBid.js: Attempting to start an auction bid.',
            {
               id: `${data.id}`,
               amount: `${data.amount}`,
               bidderId: `${data.bidder.id}`,
            },
         );

         const {
            id,
            amount,
            extended,
            bidder: { id: bidderId },
         } = data;

         const Nouns = auctionChannel.client.libraries.get('Nouns');

         const bigNumString = amount.toString();

         const bidderENS =
            (await Nouns.ensReverseLookup(bidderId)) ??
            (await shortenAddress(bidderId));
         const ethBaseUrl = 'https://etherscan.io/address/';

         const bidderLink = hyperlink(bidderENS, `${ethBaseUrl}${bidderId}`);

         const nounsLink = hyperlink(
            `Noun ${id}`,
            `https://nouns.wtf/noun/${id}`,
         );

         const amountNew = Number(
            bigNumString.slice(0, -18) + '.' + bigNumString.slice(-18),
         );

         const bidEmbed = new MessageEmbed()
            .setColor('#00FFFF')
            .setTitle(`Auction Bid`)
            .setDescription(`${bidderLink} bid ${amountNew}Ξ on ${nounsLink}`);

         Logger.info(
            'events/stateOfNouns/auctionBid.js: Successfully started an auction bid.',
            {
               id: `${data.id}`,
               amount: amountNew,
               bidderId: `${data.bidder.id}`,
            },
         );
         return await auctionChannel.send({ embeds: [bidEmbed] });
      } catch (error) {
         Logger.info('events/stateOfNouns/auctionBid.js: Received an error.', {
            error: error,
         });
      }
   },
};
