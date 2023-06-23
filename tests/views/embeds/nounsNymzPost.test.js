const { expect } = require('chai');
const { describe, it } = require('mocha');

const {
   getPostUrl,
   getUserUrl,
   getTitle,
   extractAnonymousUsernameFromId,
   findUsername,
   getUsernameHyperlink,
   generatePostBody,
} = require('../../../views/embeds/nounsNymzPost');

describe('views/embeds/nounsNymzPost.js tests', function () {
   describe('getPostUrl() tests', function () {
      it('should return link', function () {
         const result = getPostUrl(42);
         expect(result).to.equal('https://nouns.nymz.xyz/posts/42');
      });
   });

   describe('getUserUrl() tests', function () {
      it('should return link', function () {
         const result = getUserUrl(117);
         expect(result).to.equal('https://nouns.nymz.xyz/users/117');
      });
   });

   describe('getTitle() tests', function () {
      it('should return root title', function () {
         const post = {
            id: 42,
            title: 'The Answer To The Universe',
            root: {
               title: 'The Question Of The Universe',
            },
         };
         const result = getTitle(post);

         expect(result).to.equal('Reply In: The Question Of The Universe');
      });

      it('should return original title', function () {
         const post = {
            id: 42,
            title: 'The Answer To The Universe',
         };
         const result = getTitle(post);

         expect(result).to.equal('The Answer To The Universe');
      });

      it('should return default title', function () {
         const post = {
            id: 42,
            title: '',
         };
         const result = getTitle(post);

         expect(result).to.equal('New Post!');
      });

      it('should throw error', function () {
         const post = undefined;

         expect(function () {
            getTitle(post);
         }).to.throw();
      });
   });

   describe('extractAnonymousUsernameFromId() tests', function () {
      it('should return everything before the -', function () {
         const userId = '123456-7890';
         const result = extractAnonymousUsernameFromId(userId);

         expect(result).to.equal('123456');
      });

      it('should return everything before the last -', function () {
         const userId = '123-456-7890';
         const result = extractAnonymousUsernameFromId(userId);

         expect(result).to.equal('123-456');
      });

      it('should return everything if there is no -', function () {
         const userId = '1234567890';
         const result = extractAnonymousUsernameFromId(userId);

         expect(result).to.equal('1234567890');
      });
   });

   describe('findUsername() tests', function () {
      it('should deal with not-doxed users', async function () {
         const post = {
            doxed: false,
            userId: 'CT-5555',
         };
         const Nouns = undefined;

         const result = await findUsername(post, Nouns);

         expect(result).to.equal('CT');
      });

      it('should deal with doxed users', async function () {
         const post = {
            doxed: true,
            userId: 'CT-5555',
         };
         const Nouns = {
            ensReverseLookup(id) {
               return id;
            },
         };

         const result = await findUsername(post, Nouns);

         expect(result).to.equal('CT-5555');
      });
   });

   describe('getUsernameHyperlink() tests', function () {
      it('should deal with not-doxed users', async function () {
         const post = {
            doxed: false,
            userId: 'CT-5555',
         };
         const Nouns = undefined;

         const result = await getUsernameHyperlink(post, Nouns);

         expect(result).to.equal('[CT](https://nouns.nymz.xyz/users/CT-5555)');
      });

      it('should deal with doxed users', async function () {
         const post = {
            doxed: true,
            userId: 'CT-5555',
         };
         const Nouns = {
            ensReverseLookup(id) {
               return id;
            },
         };

         const result = await getUsernameHyperlink(post, Nouns);

         expect(result).to.equal(
            '[CT-5555](https://nouns.nymz.xyz/users/CT-5555)',
         );
      });
   });

   describe('generatePostBody() tests', function () {
      it('should create text body', function () {
         const post = {
            body: 'Hello There!',
         };
         const username = 'General Kenobi';

         const result = generatePostBody(post, username);

         expect(result).to.equal(
            'Hello There!\n\n**Username**\nGeneral Kenobi',
         );
      });
   });
});
