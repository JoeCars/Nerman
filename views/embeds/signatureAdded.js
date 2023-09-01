const { MessageEmbed } = require('discord.js');
const { hyperlink, inlineCode } = require('@discordjs/builders');

/**
 * @param {{slug: string, proposer: {id: string, name: string}, signer: {id: string, name: string}, reason: string, votes: number}} data
 */
exports.generateSignatureAddedEmbed = function (data) {
   const proposalTitle = data.slug
      .split('-')
      .filter(word => {
         return word.trim();
      })
      .map(word => {
         return word[0].toUpperCase() + word.substring(1);
      })
      .join(' ');
   const title = `Candidate Proposal Signed: ${proposalTitle}`;

   const proposer = hyperlink(
      data.proposer.name,
      `https://etherscan.io/address/${data.proposer.id}`,
   );
   const signer = hyperlink(
      data.signer.name,
      `https://etherscan.io/address/${data.signer.id}`,
   );
   const votes = inlineCode(data.votes);
   const reason = data.reason ? `\n\n${data.reason}` : '';
   const description = `${signer} signed ${proposer}'s proposal with ${votes} vote(s).${reason}`;

   const url = `https://nouns.wtf/candidates/${data.proposer.id.toLowerCase()}-${
      data.slug
   }`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};
