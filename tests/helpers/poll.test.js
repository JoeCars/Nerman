const { expect } = require('chai');

const { drawBlock, drawSpace } = require('../../helpers/poll');

describe('helpers/poll.js tests', function () {
   describe('drawBlock() tests', function () {
      it('should draw completed blocks', function () {
         const results1 = drawBlock(0, 3);
         const results2 = drawBlock(0, 5);
         const results3 = drawBlock(0, 8);
         const results4 = drawBlock(0, 10);

         expect(results1).to.equal('███');
         expect(results2).to.equal('█████');
         expect(results3).to.equal('████████');
         expect(results4).to.equal('██████████');
      });

      it('should add the right fractional index', function () {
         const results1 = drawBlock(7, 3);
         const results2 = drawBlock(6, 3);
         const results3 = drawBlock(5, 3);
         const results4 = drawBlock(4, 3);
         const results5 = drawBlock(3, 3);
         const results6 = drawBlock(0, 3);

         expect(results1).to.equal('███▉');
         expect(results2).to.equal('███▊');
         expect(results3).to.equal('███▋');
         expect(results4).to.equal('███▌');
         expect(results5).to.equal('███▍');
         expect(results6).to.equal('███');
      });
   });

   describe('drawSpace() tests', function () {
      it('should draw empty blocks', function () {
         const results1 = drawSpace(2);
         const results2 = drawSpace(4);
         const results3 = drawSpace(8);

         expect(results1).to.equal('\u200b \u200b ');
         expect(results2).to.equal('\u200b \u200b \u200b \u200b ');
         expect(results3).to.equal(
            '\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b ',
         );
      });

      it('should draw an empty string when 0', function () {
         const results1 = drawSpace(0);

         expect(results1).to.equal('');
      });

      it('should draw an empty string when negative', function () {
         const results1 = drawSpace(-1);
         const results2 = drawSpace(-10);

         expect(results1).to.equal('');
         expect(results2).to.equal('');
      });
   });
});
