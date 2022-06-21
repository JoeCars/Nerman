const fs = require('fs');

const getFiles = (path, ending) => {
   return fs.readdirSync(path).filter(file => file.endsWith(ending));
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

// encodeURI();

module.exports = {
   getFiles,
   logToObject,
   encodeURI,
};
