const { describe, it } = require('mocha');
const { expect } = require('chai');
const { isUserANermanDeveloper } = require('../../helpers/authorization');

describe('helpers/authorization.js tests', function () {
   describe('isUserANermanDeveloper() tests', function () {
      it('should return true when string', function () {
         process.env.BAD_BITCHES = '42,117';

         expect(isUserANermanDeveloper('42')).to.be.true;
         expect(isUserANermanDeveloper('117')).to.be.true;
      });

      it('should return false when number', function () {
         process.env.BAD_BITCHES = '42,117';

         expect(isUserANermanDeveloper(42)).to.be.false;
         expect(isUserANermanDeveloper(117)).to.be.false;
      });

      it('should return false when not part of the list', function () {
         process.env.BAD_BITCHES = '42,117';

         expect(isUserANermanDeveloper(123)).to.be.false;
         expect(isUserANermanDeveloper('123')).to.be.false;
         expect(isUserANermanDeveloper(321)).to.be.false;
         expect(isUserANermanDeveloper('321')).to.be.false;
      });
   });
});
