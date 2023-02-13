const { MessageEmbed, Channel } = require('discord.js');
const { inlineCode, hyperlink } = require('@discordjs/builders');

const shortenAddress = require('../../helpers/nouns/createNounEmbed');

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

         const baseEthUrl = 'https://etherscan.io/address/';

         // const genChannel =
         //    (await cache.get(nounsGovId)) ?? (await channels.fetch(nounsGovId));

         l({ genChannel });
         l({ data });
         l({ tokenId, fromId, toId });

         const transferEmbed = new MessageEmbed()
            .setColor('#00FFFF')
            .setTitle(`Transfer | Noun ${tokenId}`)
            .setDescription(
               `From ${hyperlink(
                  fromId,
                  `${baseEthUrl}${fromId}`
               )} to ${hyperlink(toId, `${baseEthUrl}${toId}`)}`
            )
            .setImage(`https://nouns.pics/${tokenId}.png`);

         return await genChannel.send({ embeds: [transferEmbed] });
      } catch (error) {
         console.error(error);
      }
   },
};
