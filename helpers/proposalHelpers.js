exports.getTitle = function (proposal) {
   return `Prop ${proposal.id}: ${proposal.description
      .match(/^#+\s+.+\n/)[0]
      .replaceAll(/^(#\s)|(\n+)$/g, '')}`;
};

exports.getUrl = function (proposal) {
   return `https://nouns.wtf/vote/${proposal.id}`;
};

exports.proposalStatusUpdateMessage = function (proposal, proposalStatus) {
   return `
		Proposal ${proposal.id} status changed to ${proposalStatus}.\n
		${getUrl(proposal)}
	`;
};

exports.temporaryProposalVoteMessage = function (vote) {
   return `
      Generating vote data for Prop ${vote.proposalId}.\n
      ${vote.voter.id} voted ${vote.supportDetailed} with ${vote.votes}.\n
      ${vote.reason}
   `;
};
