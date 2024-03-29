const { EmbedBuilder, hyperlink, inlineCode } = require('discord.js');

/**
 * @param {{
 *    creator: {id: string, name: string},
 * 	house: {id: string, name?: string },
 *    round: {id: string },
 *    kind: any,
 *    title: string,
 *    description: string
 * }} data
 */
exports.generateRoundCreatedEmbed = function (data) {
   const creator = hyperlink(
      data.creator.name,
      `https://etherscan.io/address/${data.creator.id}`,
   );
   const houseUrl = `https://prop.house/${data.house.id}`;
   const house = hyperlink(data.house.name ?? data.house.id, houseUrl);
   const roundUrl = `https://prop.house/${data.round.id}`;
   const round = hyperlink(data.title, roundUrl);

   const description = `${creator} created a new round in ${house}!.\n\n${round}`;

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle('PropHouse | New Round Created!')
      .setURL(roundUrl)
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
   const proposal = hyperlink(data.proposalTitle, proposalUrl);
   const roundUrl = `https://prop.house/${data.round.id}`;
   const round = hyperlink(data.round.title, roundUrl);
   const houseUrl = `https://prop.house/${data.house.id}`;
   const house = hyperlink(data.house.name ?? data.house.id, houseUrl);

   const description = `${voter} cast ${votes} votes for ${proposal} in ${house}'s ${round}!`;

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle('PropHouse | New Vote Cast!')
      .setURL(proposalUrl)
      .setDescription(description);

   return embed;
};

/**
 * @param {{
 * 	proposalId: number,
 *    proposer: {id: string, name: string},
 * 	round: {  id: string, title: string },
 *    house: { id: string, name?: string}
 *    title: string,
 *    description: string
 * }} data
 */
exports.generateProposalSubmittedEmbed = function (data) {
   const proposer = hyperlink(
      data.proposer.name,
      `https://etherscan.io/address/${data.proposer.id}`,
   );

   const proposalUrl = `https://prop.house/${data.round.id}/${data.proposalId}`;
   const proposal = hyperlink(data.title, proposalUrl);
   const roundUrl = `https://prop.house/${data.round.id}`;
   const round = hyperlink(data.round.title, roundUrl);
   const houseUrl = `https://prop.house/${data.house.id}`;
   const house = hyperlink(data.house.name ?? data.house.id, houseUrl);

   const description = `${proposer} created a new proposal in ${house}'s ${round}!\n\n${proposal}`;

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle('PropHouse | New Proposal Submitted!')
      .setURL(proposalUrl)
      .setDescription(description);

   return embed;
};
