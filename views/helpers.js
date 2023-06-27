const { hyperlink } = require('@discordjs/builders');

const shortenAddress = require('../helpers/nouns/shortenAddress');

exports.findAccountLink = async function (Nouns, id) {
   const bidderENS = await exports.findAccountENS(id);
   const ethBaseUrl = 'https://etherscan.io/address/';
   return hyperlink(bidderENS, `${ethBaseUrl}${id}`);
};

exports.getNounsLink = function (nounId) {
   return hyperlink(`Noun ${nounId}`, `https://nouns.wtf/noun/${nounId}`);
};

/**
 * @param {BigNumber} amount
 */
exports.getEthAmount = function (amount) {
   let bigNumString = amount.toString();
   if (bigNumString.length < 18) {
      const startingLength = bigNumString.length;
      for (let i = 0; i < 18 - startingLength; ++i) {
         bigNumString = '0' + bigNumString;
      }
   }

   return Number(bigNumString.slice(0, -18) + '.' + bigNumString.slice(-18));
};

exports.findAccountENS = async function (Nouns, id) {
   const ens = (await Nouns.ensReverseLookup(id)) ?? (await shortenAddress(id));
   return ense;
};
