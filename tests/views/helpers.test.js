const { expect } = require('chai');
const { describe, it } = require('mocha');
const {
   findBidderLink,
   getNounsLink,
   getEthAmount,
} = require('../../views/helpers');

describe('views/helpers.js tests', function () {
   describe('findBidderLink() tests', function () {
      it('should generate a hyperlink when Nouns is working.', async function () {
         const nouns = {
            async ensReverseLookup(id) {
               return id;
            },
         };
         const bidderId = 123;

         const results = await findBidderLink(nouns, bidderId);

         expect(results).to.eql('[123](https://etherscan.io/address/123)');
      });

      it('should generate a hyperlink when Nouns is not working.', async function () {
         const nouns = {
            async ensReverseLookup() {
               return undefined;
            },
         };
         const bidderId = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

         const results = await findBidderLink(nouns, bidderId);

         expect(results).to.eql(
            '[0x71C7...976F](https://etherscan.io/address/0x71C7656EC7ab88b098defB751B7401B5f6d8976F)',
         );
      });
   });

   describe('getNounsLink() tests', function () {
      it('should return the hyperlink correctly', function () {
         const nounId = 117;
         const result = getNounsLink(nounId);
         expect(result).to.eql('[Noun 117](https://nouns.wtf/noun/117)');
      });

      it('should return link with undefined', function () {
         const nounId = undefined;
         const result = getNounsLink(nounId);
         expect(result).to.eql(
            '[Noun undefined](https://nouns.wtf/noun/undefined)',
         );
      });
   });

   describe('getEthAmount() tests', function () {
      it('should correctly convert 20000000000000000 wei to 0.02 eth.', function () {
         const amount = 20000000000000000;
         const result = getEthAmount(amount);
         expect(result).to.eql(0.02);
      });

      it('should correctly convert 117000000000000000000 wei to 117 eth.', function () {
         const amount = 117000000000000000000;
         const result = getEthAmount(amount);
         expect(result).to.eql(117);
      });

      it('should correctly convert 4200000000000000000 wei to 4.2 eth.', function () {
         const amount = 4200000000000000000;
         const result = getEthAmount(amount);
         expect(result).to.eql(4.2);
      });
   });
});
