const { expect } = require('chai');
const { isUserAuthorized } = require('../../helpers/authorization');

describe('helpers/authorization.js tests', function () {
   describe('isUserAuthorized() tests', function () {
      it('should return true when string', function () {
         process.env.BAD_BITCHES = '42,117';

         expect(isUserAuthorized('42')).to.be.true;
         expect(isUserAuthorized('117')).to.be.true;
      });

      it('should return false when number', function () {
         process.env.BAD_BITCHES = '42,117';

         expect(isUserAuthorized(42)).to.be.false;
         expect(isUserAuthorized(117)).to.be.false;
      });

      it('should return false when not part of the list', function () {
         process.env.BAD_BITCHES = '42,117';

         expect(isUserAuthorized(123)).to.be.false;
         expect(isUserAuthorized('123')).to.be.false;
         expect(isUserAuthorized(321)).to.be.false;
         expect(isUserAuthorized('321')).to.be.false;
      });
   });
});
