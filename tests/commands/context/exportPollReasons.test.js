const assert = require('chai').assert;

const { expect } = require('chai');
const {
   attachUsernames,
   extractPollResults,
   generatePollExport,
} = require('../../../commands/context/exportPollReasons');

describe('commands/context/exportPollReasons.js tests', () => {
   describe('attachUsernames() tests', () => {
      it('should add "anonymous" when configured to be anonymous', async () => {
         let interaction = {};
         let votes = [
            {
               user: '1',
            },
            {
               user: '2',
            },
            {
               user: '3',
            },
         ];
         let targetPoll = {
            config: { anonymous: true },
         };

         await attachUsernames(interaction, votes, targetPoll);
         expect(votes).to.eql([
            {
               user: '1',
               username: 'anonymous',
            },
            {
               user: '2',
               username: 'anonymous',
            },
            {
               user: '3',
               username: 'anonymous',
            },
         ]);
      });

      it('should add usernames when configured to not be anonymous', async () => {
         let interaction = {
            guild: {
               members: {
                  async fetch(arg) {
                     return { user: { username: arg } };
                  },
               },
            },
         };
         let votes = [
            {
               user: '1',
            },
            {
               user: '2',
            },
            {
               user: '3',
            },
         ];
         let targetPoll = {
            config: { anonymous: false },
         };

         await attachUsernames(interaction, votes, targetPoll);
         expect(votes).to.eql([
            {
               user: '1',
               username: '1',
            },
            {
               user: '2',
               username: '2',
            },
            {
               user: '3',
               username: '3',
            },
         ]);
      });

      it('should handle empty votes when anonymous', async () => {
         let interaction = {
            guild: {
               members: {
                  async fetch(arg) {
                     return { user: { username: arg } };
                  },
               },
            },
         };
         let votes = [];
         let targetPoll = {
            config: { anonymous: true },
         };

         await attachUsernames(interaction, votes, targetPoll);
         expect(votes).to.eql([]);
      });

      it('should handle empty votes when not anonymous', async () => {
         let interaction = {
            guild: {
               members: {
                  async fetch(arg) {
                     return { user: { username: arg } };
                  },
               },
            },
         };
         let votes = [];
         let targetPoll = {
            config: { anonymous: false },
         };

         await attachUsernames(interaction, votes, targetPoll);
         expect(votes).to.eql([]);
      });
   });
});
