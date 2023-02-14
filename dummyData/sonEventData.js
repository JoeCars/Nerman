module.exports = (() => {
   const eventDataMap = new Map();

   eventDataMap.set('auctionCreated', null);
   eventDataMap.set('auctionBid', {
      id: 612,
      bidder: { id: '0xC66AcE54a394f9Cd2D9EA94C9Ede671D86C44479' },
      amount: '1770000000000000000',
      extended: false
   });
   eventDataMap.set('transferNouns', null);

   return eventDataMap;
})();
