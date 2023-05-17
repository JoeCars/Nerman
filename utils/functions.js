const { readdir } = require('fs').promises;
const Logger = require('../helpers/logger');

const getFiles = async (path, ending) => {
   let fileList = [];

   const files = await readdir(path, { withFileTypes: true });

   for (const file of files) {
      if (file.isDirectory()) {
         fileList = [
            ...fileList,
            ...(await getFiles(`${path}/${file.name}`, '.js')),
         ];
      } else {
         if (file.name.endsWith(ending)) {
            fileList.push(`${path}/${file.name}`);
         }
      }
   }
   Logger.debug('utils/functions.js/getFiles(): Checking file list.', {
      fileList,
   });

   return fileList;
};

const logToObject = async target => {
   console.log(
      'parse target',
      JSON.parse(
         JSON.stringify(
            target,
            (key, value) =>
               typeof value === 'bigint' ? value.toString() : value // return everything else unchanged
         )
      )
   );

   // return await JSON.parse(
   //    JSON.stringify(
   //       target,
   //       (key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
   //    )
   // );
};

const encodeURI = string => {
   const regex = /[ !"#$%&'()*+,\-.\/:;<=>?@\[\\\]\^_`\{\|\}~]/gm;

   // console.log(string);

   const encodingMap = new Map([
      [' ', '%20'],
      ['!', '%21'],
      ['"', '%22'],
      ['#', '%23'],
      ['$', '%24'],
      ['%', '%25'],
      ['&', '%26'],
      ["'", '%27'],
      ['(', '%28'],
      [')', '%29'],
      ['*', '%2A'],
      ['+', '%2B'],
      [',', '%2C'],
      ['-', '%2D'],
      ['.', '%2E'],
      ['/', '%2F'],
      [':', '%3A'],
      [';', '%3B'],
      ['<', '%3C'],
      ['=', '%3D'],
      ['>', '%3E'],
      ['?', '%3F'],
      ['@', '%40'],
      ['[', '%5B'],
      ['\\', '%5C'],
      [']', '%5D'],
      ['^', '%5E'],
      ['_', '%5F'],
      ['`', '%60'],
      ['{', '%7B'],
      ['|', '%7C'],
      ['}', '%7D'],
      ['~', '%7E'],
   ]);

   // const getCharacters = match => encodingMap.get(match);
   // const getCharacters = match => {
   //    console.log(match);
   //    console.log(encodingMap.get(match));
   //    // encodingMap.get(match);
   // };

   // console.log(string.replaceAll(regex, match => encodingMap.get(match)));
   return string.replaceAll(regex, match => encodingMap.get(match));
   // console.log(
   //    string.replaceAll(regex, match => console.log(encodingMap.get(match)))
   // );
};

const formatDate = (date, format) => {
   // Implement format options later
   // Use full months when  format parameter is programmed, for now just going to shorten months array values to 3-letter values
   // const months = [
   //    'January',
   //    'February',
   //    'March',
   //    'April',
   //    'May',
   //    'June',
   //    'July',
   //    'August',
   //    'September',
   //    'October',
   //    'November',
   //    'December',
   // ];

   const months = [
      'Jan',
      'Febr',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
   ];

   const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
   ];

   // console.log('getYear', date.getFullYear());
   // console.log('getDate', date.getDate());
   const year = date.getFullYear();
   const calendarDay = date.getDate();
   const month = months[date.getMonth()];
   // const day = days[date.getDay()];
   // const timezoneOffset = date.getTimezoneOffset();
   // const timeAbbrUTC = `UTC`;
   const tzAbbr = date
      .toLocaleTimeString('en-us', { timeZoneName: 'short' })
      .split(' ')[2];
   const hours = date.getHours();
   const minutes = date.getMinutes();
   const seconds = date.getSeconds();
   const amPm = hours >= 12 ? 'pm' : 'am';
   const time = `${hours !== 12 ? hours % 12 : 0}:${minutes
      .toString()
      .padStart(2, '0')} ${amPm}`;
   const formatted = `${time} ${tzAbbr} ${month} ${calendarDay}, ${year}`;
   // Return format: 5:00 am/pm Timezone(EST) Dec 26, 2022
   return formatted;
};

// encodeURI();

const lc = (label, bg, data) => {
   console.log(`${label}\n\x1b[48;5;${bg}m${data}\x1b[0m]`);
};

module.exports = {
   lc,
   getFiles,
   logToObject,
   encodeURI,
   formatDate,
};
