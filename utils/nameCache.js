const shortenAddress = require('../helpers/nouns/shortenAddress');

const nameCache = new Map();

exports.fetchAddressName = async (address, nouns) => {
   let name = nameCache.get(address);
   if (name) {
      return name;
   }

   name = await nouns.ensReverseLookup(address);
   if (!name) {
      name = shortenAddress(address);
   }

   nameCache.set(address, name);
   return name;
};
