const { MessageEmbed } = require('discord.js');
const { hyperlink, codeBlock } = require('@discordjs/builders');
const { log: l } = console;

module.exports = async data => {
   try {
      // const { address, ens, owned, delegated } = data;

      const {
         addressPrint,
         ownerVotingPower,
         ownerNounsOwned,
         ownerNounsDelegated,
         delegateAddressPrint,
         delegateVotingPower,
         delegateNounsOwned,
         delegateNounsDelegated,
      } = data;

      // Links:

      // const agora = `[Agora](https://www.nounsagora.com/delegate/${addressPrint})`;
      // const collective = `[Collective](https://collective.xyz/nouns/@${addressPrint})`;
      // const context = `[Context](https://context.app/${addressPrint})`;

      const ownerHyperlink = hyperlink(
         addressPrint,
         `https://etherscan.io/address/${addressPrint}`
      );
      const delegateHyperlink = hyperlink(
         delegateAddressPrint,
         `https://etherscan.io/address/${delegateAddressPrint}`
      );

      const addressCodeBlock = codeBlock(
         `Voting Power: ${ownerVotingPower}\n----------------\n - owned: ${ownerNounsOwned}\n - delegations: ${ownerNounsDelegated}`
      );
      const delegateCodeBlock = codeBlock(
         `Voting Power: ${delegateVotingPower}\n----------------\n - owned: ${delegateNounsOwned}\n - delegations: ${delegateNounsDelegated}`
      );

      const nounerEmbed = new MessageEmbed().setColor('#00FFFF').addFields(
         {
            name: `**ADDRESS**`,
            // value: `[${addressPrint}](https://etherscan.io/address/${address})\n\u200B\u200B`,
            value: `${ownerHyperlink}\n${addressCodeBlock}\n${ownerHyperlink} is delegating ${ownerNounsDelegated} votes to ${delegateHyperlink}\n\u200B`,
         },
         {
            name: `**DELEGATE**`,
            value: `${delegateHyperlink}\n${delegateCodeBlock}`,
         }
      );

      return nounerEmbed;
   } catch (err) {
      l({ err });
   }
};
