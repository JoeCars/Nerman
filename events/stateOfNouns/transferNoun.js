const { MessageEmbed, Channel } = require('discord.js');
const { inlineCode, hyperlink } = require('@discordjs/builders');

const shortenAddress = require('../../helpers/nouns/shortenAddress');

const { log: l } = console;

const mintId = '0x0000000000000000000000000000000000000000';
// const mintId = '0x55e1490a1878D0B61811726e2cB96560022E764c';
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
            // tokenId,
            from: { id: fromId },
            to: { id: toId },
         } = data;

         const tokenId = Number(data.tokenId);

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

         let transferEmbed = new MessageEmbed().setColor('#00FFFF');

         l('fromId === toId ? =>', fromId === toId);
         if (fromId === toId) {
            // transferEmbed = new MessageEmbed()
            transferEmbed
               .setTitle(`Stanky Shameless Washing | Noun ${tokenId}`)
               .setDescription(
                  `From ${hyperlink(
                     fromDisplay,
                     `${baseEthUrl}${fromId}`
                  )} to ${hyperlink(toDisplay, `${baseEthUrl}${toId}`)}`
               )
               .setImage(`https://noun.pics/${tokenId}.png`);
         } else {
            // transferEmbed = new MessageEmbed()
            transferEmbed
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
