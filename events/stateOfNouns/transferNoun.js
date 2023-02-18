const { MessageEmbed, Channel } = require('discord.js');
const { inlineCode, hyperlink } = require('@discordjs/builders');

const shortenAddress = require('../../helpers/nouns/shortenAddress');

const { log: l } = console;

const mintId = '0x0000000000000000000000000000000000000000';
const nounsTokenId = process.env.NOUNS_TOKEN_ID;

module.exports = {
   name: 'transferNoun',
   /**
    *
    * @param {Channel} genChannel
    */
   async execute(genChannel, data) {
      try {
         l('NOUN TRANSFER EVENT HANDLER');

         const {
            tokenId,
            from: { id: fromId },
            to: { id: toId },
         } = data;

         // const { } = message;
         const Nouns = genChannel.client.libraries.get('Nouns');

         const baseEthUrl = 'https://etherscan.io/address/';

         // const genChannel =
         //    (await cache.get(nounsGovId)) ?? (await channels.fetch(nounsGovId));

         l({ genChannel });
         l({ data });
         l({ tokenId });
         l({ fromId });
         l({ toId });

         l('shortenAddress(fromId) => ', await shortenAddress(fromId));
         l('shortenAddress(toId) => ', await shortenAddress(toId));

         const fromDisplay =
            (await Nouns.ensReverseLookup(fromId)) ??
            (await shortenAddress(fromId));
         const toDisplay =
            (await Nouns.ensReverseLookup(toId)) ??
            (await shortenAddress(toId));

         l({ fromDisplay });
         l({ toDisplay });

         let transferEmbed = new MessageEmbed();

         if (fromId === toId) {
            transferEmbed = new MessageEmbed()
               .setColor('#00FFFF')
               .setTitle(
                  `Stanky Shameless Washing | Noun ${tokenId}`
               )
               .setDescription(
                  `From ${hyperlink(
                     fromDisplay,
                     `${baseEthUrl}${fromId}`
                  )} to ${hyperlink(toDisplay, `${baseEthUrl}${toId}`)}`
               )
               .setImage(`https://noun.pics/${tokenId}.png`);
         } else {
            transferEmbed = new MessageEmbed()
               .setColor('#00FFFF')
               .setTitle(
                  `${
                     fromId === '0x0000000000000000000000000000000000000000'
                        ? 'Mint'
                        : 'Transfer'
                  } | Noun ${tokenId}`
               )
               .setDescription(
                  `From ${hyperlink(
                     fromDisplay,
                     `${baseEthUrl}${fromId}`
                  )} to ${hyperlink(toDisplay, `${baseEthUrl}${toId}`)}`
               )
               .setImage(`https://noun.pics/${tokenId}.png`);
         }

         return await genChannel.send({ embeds: [transferEmbed] });
      } catch (error) {
         console.error(error);
      }
   },
};
