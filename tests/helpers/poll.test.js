const { expect } = require('chai');

const {
   drawBlock,
   drawSpace,
   drawBar,
   longestString,
   randomNumber,
} = require('../../helpers/poll');

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

   describe('drawBar() tests', function () {
      it("should draw a bar of 8 that's 60% full", function () {
         const results = drawBar(8, 0.6);

         expect(results).to.equal('▏████\u200b \u200b \u200b \u200b ▕');
      });

      it("should draw a bar of 6 that's 50% full", function () {
         const results = drawBar(6, 0.5);

         expect(results).to.equal('▏███\u200b \u200b \u200b ▕');
      });

      it("should draw a bar of 5 that's 80% full", function () {
         const results = drawBar(5, 0.8);

         expect(results).to.equal('▏████\u200b ▕');
      });

      it("should draw a bar of 8 that's 55% full", function () {
         const results = drawBar(8, 0.55);

         // NOTE: I feel like the fractional logic in drawBar() is
         // needlessly complex and accomplishes nothing.
         // Why not just have it be Floor(8 * 0.55) solid bars
         // with the remaining space filled with empty space?
         expect(results).to.equal('▏████\u200b \u200b \u200b \u200b ▕');
      });
   });

   describe('longestString() tests', function () {
      it('should return longest string', function () {
         const strings = ['Monika', 'Natsuki', 'Sayori', 'Yuri'];

         const result = longestString(strings);

         expect(result).to.equal('Natsuki');
      });

      it('should return first longest string', function () {
         const strings1 = ['Jorge', 'Emile', 'Kat', 'Jun', 'Six'];
         const strings2 = ['Emile', 'Jorge', 'Kat', 'Jun', 'Six'];

         const result1 = longestString(strings1);
         const result2 = longestString(strings2);

         expect(result1).to.equal('Jorge');
         expect(result2).to.equal('Emile');
      });

      it('should be undefined if empty', function () {
         const results = longestString([]);

         expect(results).to.be.undefined;
      });
   });

   // TODO: Random number shouldn't be async.
   describe('randomNumber() tests', function () {
      it('should stay within the limit', async function () {
         for (let i = 0; i < 100; ++i) {
            expect(await randomNumber(10)).to.be.within(0, 9);
         }
      });

      it('should be 0 when the limit is 0', async function () {
         for (let i = 0; i < 100; ++i) {
            expect(await randomNumber(0)).to.equal(0);
         }
      });

      it('should be weird when the limit is negative', async function () {
         for (let i = 0; i < 100; ++i) {
            expect(await randomNumber(-10)).to.be.within(-10, -1);
         }
      });
   });
});
