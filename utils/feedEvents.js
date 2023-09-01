// Sorted lexicographically. First by group name. Then by event name.
const events = new Map();

// Federation.
events.set('federationBidPlaced', 'Federation.BidPlaced');
events.set('federationVoteCast', 'Federation.VoteCast');

// NermanPoll.
events.set('newProposalPoll', 'NermanPoll.NewProposalPoll');
events.set('threadFeedbackSent', 'NermanPoll.ThreadFeedbackSent');
events.set('threadStatusChange', 'NermanPoll.ThreadStatusChange');
events.set('threadVote', 'NermanPoll.ThreadVote');

// NounsDAOAuctions.
events.set('auctionBid', 'NounsDAOAuctions.AuctionBid');
events.set('auctionCreated', 'NounsDAOAuctions.AuctionCreated');
events.set('auctionEnd', 'NounsDAOAuctions.AuctionEnd');

// NounsDAOCandidates.
events.set('candidateFeedbackSent', 'NounsDAOCandidates.CandidateFeedbackSent');
events.set(
   'proposalCandidateCanceled',
   'NounsDAOCandidates.ProposalCandidateCanceled',
);
events.set(
   'proposalCandidateCreated',
   'NounsDAOCandidates.ProposalCandidateCreated',
);
events.set(
   'proposalCandidateUpdated',
   'NounsDAOCandidates.ProposalCandidateUpdated',
);
events.set('signatureAdded', 'NounsDAOCandidates.SignatureAdded');

// NounsDAOFork.
events.set('escrowedToFork', 'NounsDAOFork.EscrowedToFork');
events.set('executeFork', 'NounsDAOFork.ExecuteFork');
events.set('withdrawNounsFromEscrow', 'NounsDAOFork.WithdrawNounsFromEscrow');

// NounsDAOProposals.
events.set('feedbackSent', 'NounsDAOProposals.FeedbackSent');
events.set('propCreated', 'NounsDAOProposals.PropCreated');
events.set('propStatusChange', 'NounsDAOProposals.PropStatusChange');
events.set('propVoteCast', 'NounsDAOProposals.PropVoteCastNoZero');
events.set('propVoteCastOnlyZero', 'NounsDAOProposals.PropVoteCastOnlyZero');

// NounsDAOTokens.
events.set('delegateChanged', 'NounsDAOTokens.DelegateChanged');
events.set('delegateChangedNoZero', 'NounsDAOTokens.DelegateChangedNoZero');
events.set('nounCreated', 'NounsDAOTokens.NounCreated');
events.set('transferNoun', 'NounsDAOTokens.TransferNoun');

// NounsNymz.
events.set('newPost', 'NounsNymz.NewPost');

module.exports = events;
