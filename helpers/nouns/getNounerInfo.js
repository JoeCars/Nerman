module.exports = async (Nouns, address) => {
   console.log(Nouns);
   const ensRegex = /^.*\.eth$/;
   const walletRegex = /^0x[a-fA-F0-9]{40}$/;

   const result = await Nouns.getAddress(address);

   // console.log(ensRegex.test(address));
   let ens = walletRegex.test(address)
      ? await Nouns.ensReverseLookup(address)
      : address;

   console.log({ ens });
   // test with ENS beautifulnfts.eth
   // const getEns = await Nouns.ensReverseLookup(address);

   console.log('getNounerInfo.js -- RESULT', result);
   // console.log('getNounerInfo.js -- getEns', getEns);

   if (result) {
      const owned = await Nouns.NounsToken.Contract.balanceOf(result);
      console.log('Owned Nouns: ' + owned);

      const delegated = await Nouns.NounsToken.Contract.getCurrentVotes(result);
      console.log('Delegated Nouns: ' + delegated);

      return {
         address: result,
         ens: ens,
         owned: Number(owned),
         delegated: Number(delegated),
      };
   } else {
      return null;
   }
};

// getNounerInfo('vote.nounders.eth');
// getNounerInfo('nounders.eth');
