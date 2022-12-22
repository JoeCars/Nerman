module.exports = async (Nouns, address) => {
   // console.log(Nouns);
   const ensRegex = /^.*\.eth$/;
   const walletRegex = /^0x[a-fA-F0-9]{40}$/;

   const ownerAddress = await Nouns.getAddress(address);

   // console.log(ensRegex.test(address));
   // let ownerEns = walletRegex.test(address)
   //    ? await Nouns.ensReverseLookup(address)
   //    : address;

   // test with ENS beautifulnfts.eth
   // const getEns = await Nouns.ensReverseLookup(address);

   console.log('getNounerInfo.js -- ownerAddress', ownerAddress);
   // console.log('getNounerInfo.js -- getEns', getEns);

   if (ownerAddress) {
      const ownerEns = walletRegex.test(address)
         ? await Nouns.ensReverseLookup(address)
         : address;

      const ownerEnsJoel = await Nouns.ensReverseLookup(ownerAddress);

      console.log({ ownerEns });

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
      console.log('Owned Nouns: ' + ownerNounsOwned);

      const delegated = await Nouns.NounsToken.Contract.getCurrentVotes(
         ownerAddress
      );
      console.log('Delegated Nouns: ' + delegated);

      console.log('--------------------------');
      console.log('');
      console.log('ADDRESS');
      console.log(addressPrint);
      console.log('OWNER ENS');
      console.log(ownerEns);
      console.log('');
      console.log('Voting Power: ' + ownerVotingPower);
      console.log(' - owned: ' + ownerNounsOwned);
      console.log(' - delegations: ' + ownerNounsDelegated);

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

         console.log('');
         console.log(
            addressPrint +
               ' is delegating ' +
               ownerNounsOwned +
               ' votes to ' +
               delegateAddressPrint
         );
         console.log('');
         console.log('');
         console.log('DELEGATE');
         console.log(delegateAddressPrint);
         console.log('');
         console.log('Voting Power: ' + delegateVotingPower);
         console.log(' - owned: ' + delegateNounsOwned);
         console.log(' - delegations: ' + delegateNounsDelegated);
         console.log('');
         console.log('');
      }

      return {
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
      return null;
   }
};

// getNounerInfo('vote.nounders.eth');
// getNounerInfo('nounders.eth');
