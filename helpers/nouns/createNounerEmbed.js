const { MessageEmbed } = require('discord.js');
const { hyperlink, codeBlock } = require('@discordjs/builders');
const Logger = require('../logger');

module.exports = async data => {
   try {
      Logger.info(
         'helpers/nouns/createNounerEmbed.js: Creating Nouner embed.',
         {
            delegating: data.delegating,
            addressPrint: data.addressPrint,
            ownerVotingPower: data.ownerVotingPower,
            ownerNounsOwned: data.ownerNounsOwned,
            ownerNounsDelegated: data.ownerNounsDelegated,
            delegateAddressPrint: data.delegateAddressPrint,
            delegateVotingPower: data.delegateVotingPower,
            delegateNounsOwned: data.delegateNounsOwned,
            delegateNounsDelegated: data.delegateNounsDelegated,
         }
      );
      // const { address, ens, owned, delegated } = data;

      const {
         delegating,
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

      const nounerEmbed = new MessageEmbed();

      if (delegating) {
         nounerEmbed.setColor('#00FFFF').addFields(
            {
               name: `**ADDRESS**`,
               // value: `[${addressPrint}](https://etherscan.io/address/${address})\n\u200B\u200B`,
               value: `${ownerHyperlink}\n${addressCodeBlock}\n${ownerHyperlink} is delegating ${ownerNounsOwned} votes to ${delegateHyperlink}\n\u200B`,
            },
            {
               name: `**DELEGATE**`,
               value: `${delegateHyperlink}\n${delegateCodeBlock}`,
            }
         );
      } else {
         nounerEmbed.setColor('#00FFFF').addFields({
            name: `**ADDRESS**`,
            // value: `[${addressPrint}](https://etherscan.io/address/${address})\n\u200B\u200B`,
            value: `${ownerHyperlink}\n${addressCodeBlock}\n${ownerHyperlink} is not delegating.`,
         });
      }

      Logger.info(
         'helpers/nouns/createNounerEmbed.js: Finished creating Nouner embed.',
         {
            delegating: data.delegating,
            addressPrint: data.addressPrint,
            ownerVotingPower: data.ownerVotingPower,
            ownerNounsOwned: data.ownerNounsOwned,
            ownerNounsDelegated: data.ownerNounsDelegated,
            delegateAddressPrint: data.delegateAddressPrint,
            delegateVotingPower: data.delegateVotingPower,
            delegateNounsOwned: data.delegateNounsOwned,
            delegateNounsDelegated: data.delegateNounsDelegated,
         }
      );

      return nounerEmbed;
   } catch (err) {
      Logger.error('helpers/nouns/createNounerEmbed.js: Received an error.', {
         error: err,
      });
   }
};
