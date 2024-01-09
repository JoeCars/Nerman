// Sorted lexicographically. First by group name. Then by event name.
const events = new Map();

// Federation.
events.set('federationBidPlaced', 'Federation.BidPlaced');
events.set('federationVoteCast', 'Federation.VoteCast');

// Nouns
events.set('auctionBid', 'Nouns.AuctionHouse.AuctionBid');
events.set('auctionCreated', 'Nouns.AuctionHouse.AuctionCreated');
events.set('auctionEnd', 'Nouns.AuctionHouse.AuctionEnd');

events.set('delegateChanged', 'Nouns.Token.DelegateChanged');
events.set('delegateChangedNoZero', 'Nouns.Token.DelegateChangedNoZero');
events.set('nounCreated', 'Nouns.Token.NounCreated');
events.set('transferNoun', 'Nouns.Token.TransferNoun');

events.set('propCreated', 'Nouns.DAO.PropCreated');
events.set('propStatusChange', 'Nouns.DAO.PropStatusChange');
events.set('propVoteCast', 'Nouns.DAO.PropVoteCastNoZero');
events.set('propVoteCastOnlyZero', 'Nouns.DAO.PropVoteCastOnlyZero');
events.set('escrowedToFork', 'Nouns.DAO.EscrowedToFork');
events.set('executeFork', 'Nouns.DAO.ExecuteFork');
events.set('joinFork', 'Nouns.DAO.JoinFork');
events.set('withdrawNounsFromEscrow', 'Nouns.DAO.WithdrawNounsFromEscrow');

events.set('candidateFeedbackSent', 'Nouns.DAOData.CandidateFeedbackSent');
events.set(
   'proposalCandidateCanceled',
   'Nouns.DAOData.ProposalCandidateCanceled',
);
events.set(
   'proposalCandidateCreated',
   'Nouns.DAOData.ProposalCandidateCreated',
);
events.set('proposalCandidateUpdated', 'NounsDAOData.ProposalCandidateUpdated');
events.set('signatureAdded', 'Nouns.DAOData.SignatureAdded');
events.set('feedbackSent', 'Nouns.DAOData.FeedbackSent');

// NounsNymz.
events.set('newPost', 'NounsNymz.NewPost');

// NounsFork
events.set('forkAuctionCreated', 'NounsFork.AuctionHouse.ForkAuctionCreated');
events.set('forkAuctionBid', 'NounsFork.AuctionHouse.ForkAuctionBid');

events.set('forkProposalCreated', 'NounsFork.ForkProposalCreated');
events.set('forkProposalStatusChange', 'NounsFork.ForkProposalStatusChange');
events.set('forkQuit', 'NounsFork.ForkQuit');
events.set('forkVoteCast', 'NounsFork.ForkVoteCast');

events.set('forkDelegateChanged', 'NounsFork.Tokens.ForkDelegateChanged');
events.set('transferForkNoun', 'NounsFork.Tokens.TransferForkNoun');
events.set('forkNounCreated', 'NounsFork.Tokens.ForkNounCreated');

// Propdates.
events.set('postUpdate', 'Propdates.PostUpdate');

// LilNouns
events.set('lilNounsAuctionBid', 'LilNouns.AuctionBid');
events.set('lilNounsAuctionCreated', 'LilNouns.AuctionCreated');
events.set('lilNounsProposalCreated', 'LilNouns.ProposalCreated');
events.set('lilNounsProposalStatusChange', 'LilNouns.ProposalStatusChange');
events.set('lilNounsVoteCast', 'LilNouns.VoteCast');
events.set('lilNounsTransfer', 'LilNouns.Transfer');

// PropHouse
events.set('propHouseRoundCreated', 'PropHouse.RoundCreated');
events.set('propHouseHouseCreated', 'PropHouse.HouseCreated');
events.set('propHouseVoteCast', 'PropHouse.VoteCast');
events.set('propHouseProposalSubmitted', 'PropHouse.ProposalSubmitted');

// Polls.
events.set('newProposalPoll', 'Polls.Nouns.NewProposalPoll');
events.set('threadFeedbackSent', 'Polls.Nouns.ThreadFeedbackSent');
events.set('threadStatusChange', 'Polls.Nouns.ThreadStatusChange');
events.set('threadVote', 'Polls.Nouns.ThreadVote');
events.set('threadFederationBidPlaced', 'Polls.Federation..ThreadBidPlaced');
events.set('threadFederationVoteCast', 'Polls.Federation.ThreadVoteCast');
events.set('newLilNounsProposalPoll', 'Polls.LilNouns.NewProposalPoll');

module.exports = events;
