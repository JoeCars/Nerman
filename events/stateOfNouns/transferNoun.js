const { MessageEmbed, Channel } = require('discord.js');
const { inlineCode, hyperlink } = require('@discordjs/builders');

const shortenAddress = require('../../helpers/nouns/shortenAddress');

const { log: l } = console;

const generalId = process.env.NOUNCIL_GENERAL;

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
         l({ tokenId, fromId, toId });

         const fromDisplay = await (Nouns.ensReverseLookup(fromId) ??
            shortenAddress(fromId));
         const toDisplay = await (Nouns.ensReverseLookup(toId) ??
            shortenAddress(toId));

         const transferEmbed = new MessageEmbed()
            .setColor('#00FFFF')
            .setTitle(`Transfer | Noun ${tokenId}`)
            .setDescription(
               `From ${hyperlink(
                  fromDisplay,
                  `${baseEthUrl}${fromId}`
               )} to ${hyperlink(toDisplay, `${baseEthUrl}${toId}`)}`
            )
            .setImage(`https://nouns.pics/${tokenId}.png`);

         return await genChannel.send({ embeds: [transferEmbed] });
      } catch (error) {
         console.error(error);
      }
   },
};
