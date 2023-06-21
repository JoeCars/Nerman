const { expect } = require('chai');
const { describe, it } = require('mocha');
const shortenAddress = require('../../../helpers/nouns/shortenAddress');

describe('helpers/nouns/shortenAddress.js tests', function () {
   describe('shortenAddress() tests', function () {
      it('should return origin address correctly', async function () {
         const address = '0x0000000000000000000000000000000000000000';
         const results = await shortenAddress(address);
         expect(results).to.eql('0x0000...0000');
      });

      it('should return any address correctly', async function () {
         const address = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
         const results = await shortenAddress(address);
         expect(results).to.eql('0x71C7...976F');
      });

      it('should ignore ending if too short', async function () {
         const address = 'too short';
         const result = await shortenAddress(address);
         expect(result).to.eql('too sh...');
      });
   });
});
