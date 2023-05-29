const { MessageEmbed, Channel } = require('discord.js');
const { inlineCode, hyperlink } = require('@discordjs/builders');

const shortenAddress = require('../../../helpers/nouns/shortenAddress');
const Logger = require('../../../helpers/logger');

const mintId = '0x0000000000000000000000000000000000000000';
// const mintId = '0x55e1490a1878D0B61811726e2cB96560022E764c';
const nounsTokenId = process.env.NOUNS_TOKEN_ID;

module.exports = {
   name: 'transferNoun',
   /**
    *
    * @param {Channel} tokenChannel
    */
   async execute(tokenChannel, data) {
      try {
         Logger.info(
            'events/stateOfNouns/transferNoun.js: Handling a noun transfer event.',
            {
               senderId: `${data.from.id}`,
               receiverId: `${data.to.id}`,
               tokenId: `${data.tokenId}`,
            }
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

         // const tokenChannel =
         //    (await cache.get(nounsGovId)) ?? (await channels.fetch(nounsGovId));

         const fromDisplay =
            (await Nouns.ensReverseLookup(fromId)) ??
            (await shortenAddress(fromId));
         const toDisplay =
            (await Nouns.ensReverseLookup(toId)) ??
            (await shortenAddress(toId));

         let transferEmbed = new MessageEmbed().setColor('#00FFFF');

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
                  `${fromId === mintId ? 'Mint' : 'Transfer'} | Noun ${tokenId}`
               )
               .setDescription(
                  `From ${hyperlink(
                     fromDisplay,
                     `${baseEthUrl}${fromId}`
                  )} to ${hyperlink(toDisplay, `${baseEthUrl}${toId}`)}`
               )
               .setImage(`https://noun.pics/${tokenId}.png`);
         }

         Logger.info(
            'events/stateOfNouns/transferNoun.js: Finished handling a noun transfer event.',
            {
               senderId: `${data.from.id}`,
               receiverId: `${data.to.id}`,
               tokenId: `${data.tokenId}`,
            }
         );

         return await tokenChannel.send({ embeds: [transferEmbed] });
      } catch (error) {
         Logger.error(
            'events/stateOfNouns/transferNoun.js: Received an error.',
            {
               error: error,
            }
         );
      }
   },
};
