const { expect } = require('chai');
const fsp = require('fs').promises;
const path = require('path');

const { formatDate, getFiles } = require('../../utils/functions');

describe('utils/functions.js tests', function () {
   describe('getFiles() tests', function () {
      this.afterEach(async function () {
         // o get a behavior similar to the rm -rf Unix command, use fsPromises.rm() with options { recursive: true, force: true }.
         try {
            await fsp.rm(path.join(__dirname, 'test-docs'), {
               recursive: true,
               force: true,
            });
         } catch (error) {
            console.error(error);
            return;
         }
      });

      it('should find files in the directory', async function () {
         try {
            await fsp.mkdir(path.join(__dirname, 'test-docs'));
            await fsp.writeFile(
               path.join(__dirname, 'test-docs', 'file1.txt'),
               'test1',
            );
            await fsp.writeFile(
               path.join(__dirname, 'test-docs', 'file2.txt'),
               'test2',
            );
            await fsp.writeFile(
               path.join(__dirname, 'test-docs', 'file3.txt'),
               'test3',
            );
         } catch (error) {
            console.error(error);
            return;
         }

         const files = await getFiles(path.join(__dirname, 'test-docs'), 'txt');

         expect(files).to.eql([
            path.join(__dirname, 'test-docs') + '/file1.txt',
            path.join(__dirname, 'test-docs') + '/file2.txt',
            path.join(__dirname, 'test-docs') + '/file3.txt',
         ]);
      });

      it('should find files in the recursive directory', async function () {
         try {
            await fsp.mkdir(path.join(__dirname, 'test-docs'));
            await fsp.writeFile(
               path.join(__dirname, 'test-docs', 'file1.txt'),
               'test1',
            );
            await fsp.mkdir(path.join(__dirname, 'test-docs', 'recursive-1'));
            await fsp.writeFile(
               path.join(__dirname, 'test-docs', 'recursive-1', 'file2.txt'),
               'test2',
            );
            await fsp.mkdir(
               path.join(__dirname, 'test-docs', 'recursive-1', 'recursive-2'),
            );
            await fsp.writeFile(
               path.join(
                  __dirname,
                  'test-docs',
                  'recursive-1',
                  'recursive-2',
                  'file3.txt',
               ),
               'test3',
            );
         } catch (error) {
            console.error(error);
            return;
         }

         const files = await getFiles(path.join(__dirname, 'test-docs'), 'txt');

         expect(files).to.eql([
            path.join(__dirname, 'test-docs') + '/file1.txt',
            path.join(__dirname, 'test-docs') + '/recursive-1' + '/file2.txt',
            path.join(__dirname, 'test-docs') +
               '/recursive-1' +
               '/recursive-2' +
               '/file3.txt',
         ]);
      });

      it('should only return the correct endings in the directory', async function () {
         try {
            await fsp.mkdir(path.join(__dirname, 'test-docs'));
            await fsp.writeFile(
               path.join(__dirname, 'test-docs', 'file1.txt'),
               'test1',
            );
            await fsp.writeFile(
               path.join(__dirname, 'test-docs', 'file2.js'),
               'test2',
            );
            await fsp.writeFile(
               path.join(__dirname, 'test-docs', 'file3.py'),
               'test3',
            );
            await fsp.writeFile(
               path.join(__dirname, 'test-docs', 'file4.txt'),
               'test4',
            );
            await fsp.writeFile(
               path.join(__dirname, 'test-docs', 'file5.c'),
               'test5',
            );
            await fsp.writeFile(
               path.join(__dirname, 'test-docs', 'file6.php'),
               'test6',
            );
         } catch (error) {
            console.error(error);
            return;
         }

         const files = await getFiles(path.join(__dirname, 'test-docs'), 'txt');

         expect(files).to.eql([
            path.join(__dirname, 'test-docs') + '/file1.txt',
            path.join(__dirname, 'test-docs') + '/file4.txt',
         ]);
      });
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
