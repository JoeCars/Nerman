module.exports = async (Nouns, nounId) => {
   try {
      console.log('Getting Data for Noun ' + nounId);

      // Look up Owner of Noun by id
      const ownerAddress = await Nouns.NounsToken.Contract.ownerOf(nounId);

      // Look up ENS from address
      // const ownerEns = await Nouns.getAddress(ownerAddress);
      const ownerEns = await Nouns.ensReverseLookup(ownerAddress);
      // if (ownerEns) {
      //    console.log('ENS found:  FROM WAY HIGHER UP THO' + (await ownerEns));
      // }
      // console.log('getNounInfo.js -- OWNER ENS VARIABLE', { ownerEns });
      // console.log(
      //    'getNounInfo.js -- OWNER ENS VARIABLE',
      //    'ENS Found: ' + ownerEns
      // );

      // Look up delegate from ownerAddress
      const delegateAddress = await Nouns.NounsToken.Contract.delegates(
         ownerAddress
      );

      // Look up ENS from address
      const delegateEns = await Nouns.ensReverseLookup(delegateAddress);

      // Look up current votes for ownerAddress
      const votingPower = await Nouns.NounsToken.Contract.getCurrentVotes(
         delegateAddress
      );

      console.log('ownerAddress : Owner: ' + ownerAddress);
      if (ownerEns) {
         console.log('ownerEns : ENS found: ' + ownerEns);
      }
      console.log('Delegate: ' + delegateAddress);
      if (delegateEns) {
         console.log('delegateEns : ENS found: ' + delegateEns);
      }
      console.log('Voting Power:  ' + votingPower.toNumber());

      // Get Final Bid Data

      const bid = await Nouns.NounsAuctionHouse.getLatestBidData(nounId);

      //   bid : {
      //     id: number,
      //     block: numbre,
      //     date: Date,
      //     amount: number (ETH),
      //     address: string,
      //     ens: string
      // }
      console.log(await bid);

      if (bid != null) {
         const name = bid.ens != null ? bid.ens : bid.address;
         console.log(
            'Noun ' +
               bid.id +
               ' sold for ' +
               bid.amount +
               ' ETH to ' +
               name +
               ' on ' +
               bid.date.toLocaleString()
         );

         return {
            ownerAddress,
            ownerEns,
            delegateAddress,
            delegateEns,
            votingPower: votingPower.toNumber(),
            bid,
         };
      } else {
         return {
            ownerAddress,
            ownerEns,
            delegateAddress,
            delegateEns,
            votingPower: votingPower.toNumber(),
            nounId,
         };
      }
   } catch (error) {
      console.trace(error);
   }
};
