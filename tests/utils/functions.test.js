const { expect } = require('chai');
const { formatDate } = require('../../utils/functions');

describe('utils/functions.js tests', function () {
   describe('getFiles() tests', function () {
      it('should ');
   });

   describe('formatDate() tests', function () {
      it('should match current time format', function () {
         const date = new Date();

         const result = formatDate(date);

         expect(result).to.match(
            /[0-9]{1,2}:[0-9]{2} (am|pm) [A-Z]{3} [A-Z][a-z]{2} [0-9]{1,2}, [0-9]{4}/,
         );
      });

      it('should convert am date to format', function () {
         const date = new Date(2023, 5, 5, 10, 58);

         const result = formatDate(date);

         expect(result).to.match(/10:58 am [A-Z]{3} Jun 5, 2023/);
      });

      it('should convert pm date to format', function () {
         const date = new Date(2023, 11, 25, 23, 59);

         const result = formatDate(date);

         expect(result).to.match(/11:59 pm [A-Z]{3} Dec 25, 2023/);
      });
   });
});
