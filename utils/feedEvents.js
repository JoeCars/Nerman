// Sorted lexicographically. First by group name. Then by event name.
const events = new Map();
events.set('newProposalPoll', 'Nerman.NewProposalPoll');
events.set('threadStatusChange', 'Nerman.ThreadStatusChange');
events.set('threadVote', 'Nerman.ThreadVote');
events.set('auctionBid', 'NounsDAO.AuctionBid');
events.set('auctionCreated', 'NounsDAO.AuctionCreated');
events.set('delegateChanged', 'NounsDAO.DelegateChanged');
events.set('delegateChangedNoZero', 'NounsDAO.DelegateChangedNoZero');
events.set('nounCreated', 'NounsDAO.NounCreated');
events.set('propCreated', 'NounsDAO.PropCreated');
events.set('propStatusChange', 'NounsDAO.PropStatusChange');
events.set('propVoteCast', 'NounsDAO.PropVoteCast');
events.set('transferNoun', 'NounsDAO.TransferNoun');
events.set('newPost', 'NounsNymz.NewPost');
module.exports = events;
