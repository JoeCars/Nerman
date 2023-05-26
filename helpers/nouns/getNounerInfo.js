const Logger = require('../logger');

module.exports = async (Nouns, address) => {
   Logger.info('helpers/nouns/getNounerInfo.js: Getting Nouner info.', {
      address: address,
   });

   const ensRegex = /^.*\.eth$/;
   const walletRegex = /^0x[a-fA-F0-9]{40}$/;

   const ownerAddress = await Nouns.getAddress(address);

   // console.log(ensRegex.test(address));
   // let ownerEns = walletRegex.test(address)
   //    ? await Nouns.ensReverseLookup(address)
   //    : address;

   // test with ENS beautifulnfts.eth
   // const getEns = await Nouns.ensReverseLookup(address);

   Logger.debug('helpers/nouns/getNounerInfo.js: Checking owner address.', {
      ownerAddress: ownerAddress,
   });

   if (ownerAddress) {
      const ownerEns = walletRegex.test(address)
         ? await Nouns.ensReverseLookup(address)
         : address;

      const ownerEnsJoel = await Nouns.ensReverseLookup(ownerAddress);

      const delegateAddress = await Nouns.getAddress(
         await Nouns.NounsToken.Contract.delegates(ownerAddress)
      );

      const delegateDelegateAddress = await Nouns.getAddress(
         await Nouns.NounsToken.Contract.delegates(delegateAddress)
      );

      const delegating = delegateAddress && delegateAddress != ownerAddress;

      const delegateDelegating = delegateDelegateAddress != delegateAddress;

      // const owned = await Nouns.NounsToken.Contract.balanceOf(ownerAddress);
      const addressPrint = ownerEnsJoel == null ? ownerAddress : ownerEnsJoel;

      const ownerNounsOwned = await Nouns.NounsToken.Contract.balanceOf(
         ownerAddress
      );

      const ownerVotingPower = await Nouns.NounsToken.Contract.getCurrentVotes(
         ownerAddress
      );

      const ownerNounsDelegated = delegating
         ? ownerVotingPower
         : ownerVotingPower - ownerNounsOwned;

      const delegated = await Nouns.NounsToken.Contract.getCurrentVotes(
         ownerAddress
      );

      Logger.debug(
         'helpers/nouns/getNounerInfo.js: Checking owner address details.',
         {
            ownerAddress: ownerAddress,
            ownerEns: ownerEns,
            delegateAddress: delegateAddress,
            delegateDelegateAddress: delegateDelegateAddress,
            delegating: delegating,
            delegateDelegating: delegateDelegating,
            addressPrint: addressPrint,
            ownerNounsOwned: ownerNounsOwned,
            ownerVotingPower: ownerVotingPower,
            ownerNounsDelegated: ownerNounsDelegated,
            delegated: delegated,
         }
      );

      let [
         delegateAddressPrint,
         delegateVotingPower,
         delegateNounsOwned,
         delegateNounsDelegated,
      ] = [null, null, null, null];

      if (delegating) {
         const delegateEns = await Nouns.ensReverseLookup(delegateAddress);

         // const delegateAddressPrint =
         // delegateEns == null ? delegateAddress : delegateEns;
         // const dAdPrint = await delegateEns == null ? delegateAddress : delegateEns;
         delegateAddressPrint =
            (await delegateEns) == null ? delegateAddress : delegateEns;

         // console.log('DADPRINT LOL WTF', { dAdPrint });
         delegateNounsOwned = await Nouns.NounsToken.Contract.balanceOf(
            delegateAddress
         );

         // const delegateNounsOwned = await Nouns.NounsToken.Contract.balanceOf(
         //    delegateAddress
         // );
         // const delegateVotingPower =
         delegateVotingPower = await Nouns.NounsToken.Contract.getCurrentVotes(
            delegateAddress
         );

         // const delegateNounsDelegated = delegateDelegating
         delegateNounsDelegated = delegateDelegating
            ? delegateVotingPower
            : delegateVotingPower - delegateNounsOwned;

         Logger.info(
            `helpers/nouns/getNounerInfo.js: ${addressPrint} is delegating ${ownerNounsOwned} votes to ${delegateAddressPrint}.`
         );

         Logger.debug(
            'helpers/nouns/getNounerInfo.js: Checking delegation details.',
            {
               ownerAddress: ownerAddress,
               addressPrint: addressPrint,
               ownerNounsOwned: ownerNounsOwned,
               delegating: delegating,
               delegateEns: delegateEns,
               delegateAddressPrint: delegateAddressPrint,
               delegateNounsOwned: delegateNounsOwned,
               delegateVotingPower: delegateVotingPower,
               delegateNounsDelegated: delegateNounsDelegated,
            }
         );
      }

      Logger.info(
         'helpers/nouns/getNounerInfo.js: Finished getting Nouner info.',
         {
            address: address,
         }
      );

      return {
         delegating,
         addressPrint,
         ownerVotingPower,
         ownerNounsOwned,
         ownerNounsDelegated,
         // delegateAddressPrint:
         // (await delegateEns) == null ? delegateAddress : delegateEns,
         delegateAddressPrint,
         delegateVotingPower,
         delegateNounsOwned,
         delegateNounsDelegated,
      };
      return {
         // address: result,
         ens: ownerEns,
         // owned: Number(owned),
         owned: Number(ownerNounsOwned),
         delegated: Number(delegated),
      };
   } else {
      Logger.info(
         'helpers/nouns/getNounerInfo.js: Unable to get useful Nouner information from the address.',
         {
            address: address,
         }
      );
      return null;
   }
};

// getNounerInfo('vote.nounders.eth');
// getNounerInfo('nounders.eth');
