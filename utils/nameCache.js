const shortenAddress = require('../helpers/nouns/shortenAddress');
const Logger = require('../helpers/logger');

const nameCache = new Map();

exports.fetchAddressName = async (address, nouns) => {
   let name = nameCache.get(address);
   if (name) {
      return name;
   }

   try {
      name = await nouns.ensReverseLookup(address);
   } catch (error) {
      Logger.warn(
         'utils/nameCache.js: Unable fetch address. Shortening address instead.',
         {
            error,
         },
      );
      name = null;
   }
   if (!name) {
      name = shortenAddress(address);
   }

   nameCache.set(address, name);
   return name;
};
