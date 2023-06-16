const { expect } = require('chai');
const { timeDiffCalc } = require('../../helpers/timestuff');

describe('helpers/timestuff.js tests', function () {
   describe('timeDiffCalc() tests', function () {
      it('should return difference between dates', function () {
         const day1 = new Date(2023, 5, 5, 12, 0, 0);
         const day2 = new Date(2023, 5, 4, 12, 0, 0);

         const results = timeDiffCalc(day1, day2);

         expect(results).to.eql({
            days: 1,
            hours: 0,
            minutes: 0,
            seconds: 0,
         });
      });

      it('should return difference between dates regardless of order', function () {
         const day1 = new Date(2023, 5, 5, 12, 0, 0);
         const day2 = new Date(2023, 5, 4, 12, 0, 0);

         const results = timeDiffCalc(day2, day1);

         expect(results).to.eql({
            days: 1,
            hours: 0,
            minutes: 0,
            seconds: 0,
         });
      });

      it('should convert years to days', function () {
         const day1 = new Date(2023, 5, 5, 12, 0, 0);
         const day2 = new Date(2022, 5, 4, 12, 0, 0);

         const results = timeDiffCalc(day2, day1);

         expect(results).to.eql({
            days: 366,
            hours: 0,
            minutes: 0,
            seconds: 0,
         });
      });
   });
});
