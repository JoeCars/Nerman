const { MessageEmbed, Channel } = require('discord.js');
const { inlineCode, hyperlink } = require('@discordjs/builders');

const shortenAddress = require('../../../helpers/nouns/shortenAddress');
const Logger = require('../../../helpers/logger');

const mintId = '0x0000000000000000000000000000000000000000';
// const mintId = '0x55e1490a1878D0B61811726e2cB96560022E764c';

module.exports = {
   name: 'transferNoun',
   /**
    *
    * @param {Channel} tokenChannel
    */
   async execute(tokenChannel, data) {
      try {
         Logger.info(
            'events/nouns/transferNoun.js: Handling a noun transfer event.',
            {
               senderId: `${data.from.id}`,
               receiverId: `${data.to.id}`,
               tokenId: `${data.tokenId}`,
            },
         );

         const {
            // tokenId,
            from: { id: fromId },
            to: { id: toId },
         } = data;

         const tokenId = Number(data.tokenId);

         // const { } = message;
         const Nouns = tokenChannel.client.libraries.get('Nouns');

         const baseEthUrl = 'https://etherscan.io/address/';

         const fromDisplay =
            (await Nouns.ensReverseLookup(fromId)) ??
            (await shortenAddress(fromId));
         const toDisplay =
            (await Nouns.ensReverseLookup(toId)) ??
            (await shortenAddress(toId));

         const transferEmbed = new MessageEmbed().setColor('#00FFFF');

         if (fromId === toId) {
            // transferEmbed = new MessageEmbed()
            transferEmbed
               .setTitle(`Stanky Shameless Washing | Noun ${tokenId}`)
               .setDescription(
                  `From ${hyperlink(
                     fromDisplay,
                     `${baseEthUrl}${fromId}`,
                  )} to ${hyperlink(toDisplay, `${baseEthUrl}${toId}`)}`,
               )
               .setImage(`https://noun.pics/${tokenId}.png`);
         } else {
            // transferEmbed = new MessageEmbed()
            transferEmbed
               .setTitle(
                  `${
                     fromId === mintId ? 'Mint' : 'Transfer'
                  } | Noun ${tokenId}`,
               )
               .setDescription(
                  `From ${hyperlink(
                     fromDisplay,
                     `${baseEthUrl}${fromId}`,
                  )} to ${hyperlink(toDisplay, `${baseEthUrl}${toId}`)}`,
               )
               .setImage(`https://noun.pics/${tokenId}.png`);
         }

         Logger.info(
            'events/nouns/transferNoun.js: Finished handling a noun transfer event.',
            {
               senderId: `${data.from.id}`,
               receiverId: `${data.to.id}`,
               tokenId: `${data.tokenId}`,
            },
         );

         return await tokenChannel.send({ embeds: [transferEmbed] });
      } catch (error) {
         Logger.error('events/nouns/transferNoun.js: Received an error.', {
            error: error,
         });
      }
   },
};