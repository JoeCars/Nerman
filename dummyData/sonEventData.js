module.exports = (() => {
   const eventDataMap = new Map();

   eventDataMap.set('auctionCreated', null);
   eventDataMap.set('auctionBid', {
      id: 612,
      bidder: { id: '0xC66AcE54a394f9Cd2D9EA94C9Ede671D86C44479' },
      amount: 1770000000000000000,
      extended: false,
   });
   eventDataMap.set('transferNoun', {
      from: { id: '0x5606B493c51316A9e65c9b2A00BbF7Ff92515A3E' },
      to: { id: '0x3004E7d0bA11BcD506349F1062eA57f7037F0BBd' },
      tokenId: 608,
   });

   return eventDataMap;
})();
