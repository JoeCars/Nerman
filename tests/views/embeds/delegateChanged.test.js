const { expect } = require('chai');
const { describe, it } = require('mocha');

const { extractVoteChange } = require('../../../views/embeds/contracts/nouns-token');

describe('views/embeds/nounsNymzPost.js tests', function () {
   describe('extractVoteChange() tests', function () {
      it('should return 6', function () {
         const hex =
            '0x00000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000';
         const result = extractVoteChange(hex);
         expect(result).to.equal(6);
      });

      it('should return 1', function () {
         const hex =
            '0x00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003';
         const result = extractVoteChange(hex);
         expect(result).to.equal(1);
      });

      it('should return 2', function () {
         const hex =
            '0x00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000';
         const result = extractVoteChange(hex);
         expect(result).to.equal(2);
      });
   });
});
