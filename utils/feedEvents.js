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
events.set('threadFederationBidPlaced', 'NermanPoll.ThreadFederationBidPlaced');
events.set('threadFederationVoteCast', 'NermanPoll.ThreadFederationVoteCast');

// NounsAuctionHouse.
events.set('auctionBid', 'NounsAuctionHouse.AuctionBid');
events.set('auctionCreated', 'NounsAuctionHouse.AuctionCreated');
events.set('auctionEnd', 'NounsAuctionHouse.AuctionEnd');

// NounsToken.
events.set('delegateChanged', 'NounsToken.DelegateChanged');
events.set('delegateChangedNoZero', 'NounsToken.DelegateChangedNoZero');
events.set('nounCreated', 'NounsToken.NounCreated');
events.set('transferNoun', 'NounsToken.TransferNoun');

// NounsNymz.
events.set('newPost', 'NounsNymz.NewPost');

// NounsDAO.
events.set('propCreated', 'NounsDAO.PropCreated');
events.set('propStatusChange', 'NounsDAO.PropStatusChange');
events.set('propVoteCast', 'NounsDAO.PropVoteCastNoZero');
events.set('propVoteCastOnlyZero', 'NounsDAO.PropVoteCastOnlyZero');
events.set('escrowedToFork', 'NounsDAO.EscrowedToFork');
events.set('executeFork', 'NounsDAO.ExecuteFork');
events.set('joinFork', 'NounsDAO.JoinFork');
events.set('withdrawNounsFromEscrow', 'NounsDAO.WithdrawNounsFromEscrow');

// NounsDAOData.
events.set('candidateFeedbackSent', 'NounsDAOData.CandidateFeedbackSent');
events.set(
   'proposalCandidateCanceled',
   'NounsDAOData.ProposalCandidateCanceled',
);
events.set('proposalCandidateCreated', 'NounsDAOData.ProposalCandidateCreated');
events.set('proposalCandidateUpdated', 'NounsDAOData.ProposalCandidateUpdated');
events.set('signatureAdded', 'NounsDAOData.SignatureAdded');
events.set('feedbackSent', 'NounsDAOData.FeedbackSent');

// NounsForkAuctionHouse.
events.set('forkAuctionCreated', 'NounsForkAuctionHouse.ForkAuctionCreated');
events.set('forkAuctionBid', 'NounsForkAuctionHouse.ForkAuctionBid');

// NounsFork.
events.set('forkProposalCreated', 'NounsFork.ForkProposalCreated');
events.set('forkProposalStatusChange', 'NounsFork.ForkProposalStatusChange');
events.set('forkQuit', 'NounsFork.ForkQuit');
events.set('forkVoteCast', 'NounsFork.ForkVoteCast');

// NounsForkTokens.
events.set('forkDelegateChanged', 'NounsForkTokens.ForkDelegateChanged');
events.set('transferForkNoun', 'NounsForkTokens.TransferForkNoun');
events.set('forkNounCreated', 'NounsForkTokens.ForkNounCreated');

// Propdates.
events.set('postUpdate', 'Propdates.PostUpdate');

// LilNouns
events.set('lilNounsAuctionBid', 'LilNouns.AuctionBid');
events.set('lilNounsAuctionCreated', 'LilNouns.AuctionCreated');
events.set('lilNounsProposalCreated', 'LilNouns.ProposalCreated');
events.set('lilNounsProposalStatusChange', 'LilNouns.ProposalStatusChange');
events.set('lilNounsVoteCast', 'LilNouns.VoteCast');
events.set('lilNounsTransfer', 'LilNouns.Transfer');

// LilNounsPolls.
events.set('newLilNounsProposalPoll', 'LilNounsPoll.NewProposalPoll');

// PropHouse
events.set('propHouseRoundCreated', 'PropHouse.RoundCreated');
events.set('propHouseHouseCreated', 'PropHouse.HouseCreated');
events.set('propHouseVoteCast', 'PropHouse.VoteCast');
events.set('propHouseProposalSubmitted', 'PropHouse.ProposalSubmitted');
events.set('propHouseNounsRoundCreated', 'PropHouse.Nouns.RoundCreated');
events.set('propHouseNounsVoteCast', 'PropHouse.Nouns.VoteCast');
events.set(
   'propHouseNounsProposalSubmitted',
   'PropHouse.Nouns.ProposalSubmitted',
);

module.exports = events;
