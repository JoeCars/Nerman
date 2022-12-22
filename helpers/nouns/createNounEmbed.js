const { MessageEmbed } = require('discord.js');
const shortenAddress = require('./shortenAddress');
const { log: l } = console;

module.exports = async (data, attachment) => {
   const {
      ownerAddress,
      ownerEns,
      delegateAddress,
      delegateEns,
      votingPower,
      bid: { id, date, amount, ens: bidEns, address: bidAddress },
   } = data;

   // Links:
   const nounsDao = `[Nouns DAO](https://thenounsdao.com/noun/${id})`;
   const agora = `[Agora](https://www.nounsagora.com/delegate/${delegateAddress})`;
   const collective = `[Collective](https://collective.xyz/nouns/@${ownerAddress})`;

   l({ ownerEns });
   l({ ownerAddress });

   const testString = `This string is testing to see if coalescence is the right choice for selecting a noun thing: ${
      ownerEns ?? ownerAddress
   }`;

   l({ testString });

   // Noun ID
   const heldBy = `Held by: [${
      ownerEns ?? (await shortenAddress(ownerAddress))
   }](https://etherscan.io/address/${ownerAddress})\n\u200B\u200B`;

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
   const localeDate = `Date: ${date.toLocaleString('en-US', localeOptions)}`;
   const ethAmount = `Bid: ${amount} ETH`;
   const auction = `${winner}\n${localeDate}\n${ethAmount}\n\u200B\u200B`;

   // Governance
   const delegate = `Delegate: [${
      delegateEns ?? (await shortenAddress(delegateAddress))
   }](https://etherscan.io/address/${delegateAddress})`;
   const votePower = `Voting Power: ${votingPower}`;
   const links = `${nounsDao}, ${agora}, ${collective}`;
   const governance = `${delegate}\n${votePower}\n--\n${links}`;

   const nounEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .addFields(
         {
            name: `**NOUN** ${id}`,
            value: `${heldBy}`,
         },
         { name: `**AUCTION**`, value: `${auction}` },
         { name: `**GOVERNANCE**`, value: `${governance}` }
      )
      .setImage(attachment);

   return nounEmbed;
};
