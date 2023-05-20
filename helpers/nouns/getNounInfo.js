const Logger = require('../logger');

module.exports = async (Nouns, nounId) => {
   try {
      Logger.info(
         `helpers/nouns/getNounInfo.js: Getting data for Noun ${nounId}.`,
         {
            nounId: nounId,
         }
      );

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

      // Get Final Bid Data
      const bid = await Nouns.NounsAuctionHouse.getLatestBidData(nounId);

      Logger.debug(
         'helpers/nouns/getNounInfo.js: Checking owner information.',
         {
            nounId: nounId,
            ownerAddress: ownerAddress,
            ownerEns: ownerEns,
            delegateAddress: delegateAddress,
            delegateEns: delegateEns,
            votingPower: votingPower,
         }
      );

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

         Logger.info(
            `helpers/nouns/getNounInfo.js: Finished getting Noun info. Noun ${
               bid.id
            } sold for ${
               bid.amount
            } ETH to ${name} on ${bid.date.toLocaleString()}.`,
            {
               nounId: nounId,
            }
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
         Logger.info(
            'helpers/nouns/getNounInfo.js: Finished getting Noun info.',
            {
               nounId: nounId,
            }
         );

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
      Logger.error('helpers/nouns/getNounInfo.js: Received an error.', {
         error: error,
      });
   }
};
