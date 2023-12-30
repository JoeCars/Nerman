const {
   EmbedBuilder,
   hyperlink,
   hideLinkEmbed,
   inlineCode,
} = require('discord.js');

/**
 * @param {{
 *    creator: {id: string, name: string},
 * 	house: {id: string },
 *    round: {id: string },
 *    kind: any,
 *    title: string,
 *    description: string
 * }} data
 */
exports.generateRoundCreatedEmbed = function (data) {
   const url = `https://prop.house/${data.round.id}`;
   const creator = hyperlink(
      data.creator.name,
      `https://etherscan.io/address/${data.creator.id}`,
   );

   const description = `${creator} created a new round!.\n\n${data.title}`;

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle('PropHouse | New Round Created!')
      .setURL(url)
      .setDescription(description);

   return embed;
};

/**
 * @param {{
 *    creator: {id: string, name: string},
 * 	  house: {id: string },
 *    kind: any,
 * }} data
 */
exports.generateHouseCreatedEmbed = function (data) {
   const url = `https://prop.house/${data.house.id}`;
   const creator = hyperlink(
      data.creator.name,
      `https://etherscan.io/address/${data.creator.id}`,
   );

   const description = `${creator} created a new house!`;

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle('PropHouse | New House Created!')
      .setURL(url)
      .setDescription(description);

   return embed;
};

/**
 * @param {{
 *    voter: {id: string, name: string},
 * 	round: {id: string, title: string },
 * 	proposalId: number,
 * 	votingPower: string,
 *    proposal: {title: string}
 *    house: {id: string, name?: string}
 * }} data
 */
exports.generateVoteCastEmbed = function (data) {
   const voter = hyperlink(
      data.voter.name,
      `https://etherscan.io/address/${data.voter.id}`,
   );
   const votes = inlineCode(data.votingPower);
   const proposalUrl = `https://prop.house/${data.round.id}/${data.proposalId}`;
   const proposal = hyperlink(data.proposal.title, proposalUrl);
   const roundUrl = `https://prop.house/${data.round.id}`;
   const round = hyperlink(data.round.title, roundUrl);
   const houseUrl = `https://prop.house/${data.house.id}`;
   const house = hyperlink(data.house.name ?? data.house.id, houseUrl);

   const description = `${voter} cast ${votes} votes for ${proposal} in ${house} ${round}!`;

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle('PropHouse | New Vote Cast!')
      .setURL(proposalUrl)
      .setDescription(description);

   return embed;
};

/**
 * @param {{
 * 	  proposalId: number,
 *    proposer: {id: string, name: string},
 * 	  round: {id: string },
 *    title: string,
 *    description: string
 * }} data
 */
exports.generateProposalSubmittedEmbed = function (data) {
   const url = `https://prop.house/${data.round.id}/${data.proposalId}`;
   const proposer = hyperlink(
      data.proposer.name,
      `https://etherscan.io/address/${data.proposer.id}`,
   );

   const description = `${proposer} created a new proposal!\n\n${data.title}`;

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle('PropHouse | New Proposal Submitted!')
      .setURL(url)
      .setDescription(description);

   return embed;
};
