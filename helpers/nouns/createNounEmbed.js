const { MessageEmbed } = require('discord.js');
const shortenAddress = require('./shortenAddress');
const Logger = require('../logger');

module.exports = async (data, attachment) => {
   Logger.info('helpers/nouns/createNounEmbed.js: Creating Noun embed.', {
      ownerAddress: data.ownerAddress,
      ownerEns: data.ownerEns,
      delegateAddress: data.delegateAddress,
      delegateEns: data.delegateEns,
      votingPower: data.votePower,
      bid: data.bid,
   });

   const {
      ownerAddress,
      ownerEns,
      delegateAddress,
      delegateEns,
      votingPower,
      bid,
      // bid: {
      //    date = null,
      //    amount = null,
      //    ens: bidEns = null,
      //    address: bidAddress = null,
      // },
   } = data;

   let id;

   const {
      date,
      amount,
      ens: bidEns,
      address: bidAddress,
   } = bid ? bid : { date: null, amount: null, ens: null, address: null };

   if (bid) {
      id = bid.id;
   } else {
      id = data.nounId;
   }

   // Links:
   const nounsDao = `[Nouns DAO](https://thenounsdao.com/noun/${id})`;
   const agora = `[Agora](https://www.nounsagora.com/delegate/${delegateAddress})`;
   const collective = `[Collective](https://collective.xyz/nouns/@${ownerAddress})`;

   const testString = `This string is testing to see if coalescence is the right choice for selecting a noun thing: ${
      ownerEns ?? ownerAddress
   }`;

   // Noun ID
   const heldBy = `Held by: [${
      ownerEns ?? (await shortenAddress(ownerAddress))
   }](https://etherscan.io/address/${ownerAddress})\n\u200B\u200B`;

   // // Auction
   // const localeOptions = {
   //    year: 'numeric',
   //    month: 'short',
   //    day: 'numeric',
   //    hour: 'numeric',
   //    minute: 'numeric',
   //    hour12: true,
   // };

   // const winner = `Winner: [${
   //    bidEns ?? (await shortenAddress(bidAddress))
   // }](https://etherscan.io/address/${bidAddress})`;
   // const localeDate = !!bid
   //    ? `Date: ${date.toLocaleString('en-US', localeOptions)}`
   //    : null;
   // const ethAmount = !!bid ? `Bid: ${amount} ETH` : null;
   // const auction = !!bid
   //    ? `${winner}\n${localeDate}\n${ethAmount}\n\u200B\u200B`
   //    : null;

   // Governance
   const delegate = `Delegate: [${
      delegateEns ?? (await shortenAddress(delegateAddress))
   }](https://etherscan.io/address/${delegateAddress})`;
   const votePower = `Voting Power: ${votingPower}`;
   const links = `${nounsDao}, ${agora}, ${collective}`;
   const governance = `${delegate}\n${votePower}\n--\n${links}`;

   const nounEmbed = new MessageEmbed().setColor('#00FFFF');

   if (bid) {
      // Auction
      const localeOptions = {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
         hour: 'numeric',
         minute: 'numeric',
         hour12: true,
      };

      const winner = `Winner: [${
         bidEns ?? (await shortenAddress(bidAddress))
      }](https://etherscan.io/address/${bidAddress})`;
      const localeDate = !!bid
         ? `Date: ${date.toLocaleString('en-US', localeOptions)}`
         : null;
      const ethAmount = !!bid ? `Bid: ${amount} ETH` : null;
      const auction = !!bid
         ? `${winner}\n${localeDate}\n${ethAmount}\n\u200B\u200B`
         : null;

      nounEmbed
         .addFields(
            {
               name: `**NOUN** ${id}`,
               value: `${heldBy}`,
            },
            { name: `**AUCTION**`, value: `${auction}` },
            { name: `**GOVERNANCE**`, value: `${governance}` }
         )
         .setImage(attachment);
   } else {
      nounEmbed
         .addFields(
            {
               name: `**NOUN** ${id}`,
               value: `${heldBy}`,
            },
            { name: `**GOVERNANCE**`, value: `${governance}` }
         )
         .setImage(attachment);
   }

   Logger.info(
      'helpers/nouns/createNounEmbed.js: Finished creating Noun embed.',
      {
         ownerAddress: data.ownerAddress,
         ownerEns: data.ownerEns,
         delegateAddress: data.delegateAddress,
         delegateEns: data.delegateEns,
         votingPower: data.votePower,
         bid: data.bid,
      }
   );

   return nounEmbed;
};
