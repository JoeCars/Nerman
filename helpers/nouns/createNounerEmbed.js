const { MessageEmbed } = require('discord.js');
const { log: l } = console;

module.exports = async data => {
   try {
      const { address, ens, owned, delegated } = data;

      // Links:
      const agora = `[Agora](https://www.nounsagora.com/delegate/${address})`;
      const collective = `[Collective](https://collective.xyz/nouns/@${address})`;
      const context = `[Context](https://context.app/${ens ?? address})`;

      const nounerEmbed = new MessageEmbed().setColor('#00FFFF').addFields(
         {
            name: `**NOUNER**`,
            value: `[${ens}](https://etherscan.io/address/${address})\n\u200B\u200B`,
         },
         {
            name: `**NOUNS**`,
            value: `Nouns Owned: ${owned}\nNouns Delegated: ${delegated}\n---\nVoting Power: ${
               owned + delegated
            }\n\u200B\u200B`,
         },
         {
            name: `**LINKS**`,
            value: `${agora}, ${collective}, ${context}`,
         }
      );

      return nounerEmbed;
   } catch (err) {
      console.log({ err });
   }
};
