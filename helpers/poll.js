// Block arrays to denote blocks of progress beginning at 0 and increasing in steps of 0.125
const step = 0.125;
const complete = '█';
// const uniYBlockArray = ['', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
const uniXBlockArray = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];
const barStart = '▏';
const barEnd = '▕';

// const maxLength = 16;
// const portion = 12 / 35;

// Functions:
const drawBlock = (fracIndex, completeBlocks) => {
   // const drawBlock = function (fracIndex, completeBlocks) {
   let blocks = '';

   for (let i = 0; i < completeBlocks; i++) {
      blocks += complete;
   }

   blocks += uniXBlockArray[fracIndex];

   return blocks;
};

const drawSpace = emptySpace => {
   // const drawSpace = function (emptySpace) {
   let spaces = '';

   for (let i = 0; i < emptySpace; i++) {
      spaces += '\u200b ';
   }

   return spaces;
};

// Create a bar
const drawBar = function (maxLength, portion) {
   // assume maxLength = 8, and portion = 0.6 => 5 total votes, 3 botes for 'this'
   const length = portion * maxLength; // 0.6 * 8 = 4.8
   const completeBlocks = Math.floor(length); // 4
   const fracPart = length - completeBlocks; // 4.8 - 4 = 0.8

   // !testing
   const divided = fracPart / step;
   const rounded = Math.round(divided);
   const difference = rounded - divided;
   let fracIndex;

   if (difference === 0) {
      fracIndex = 0;
   }

   if (difference < 0) {
      let abs = Math.abs(difference);
      fracIndex = abs >= 0.5 ? 4 : 0;
   }

   if (difference > 0) {
      let abs = Math.abs(difference);
      fracIndex = abs <= 0.5 ? 4 : 0;
   }

   // disabled for testing
   // const fracIndex = Math.round(fracPart / step); // 0.8 / 0.125 = 6.4, rounded = 6
   // const uniXBlockArray = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];
   // !test usng fracIndexx to test this new method for half bars
   const filledBar = drawBlock(fracIndex, completeBlocks); // should be '████▊'
   const emptySpace = maxLength - filledBar.length; // 8 - 5 = 3
   const emptyBar = drawSpace(emptySpace); // '\u200b u200b u200b '

   // console.log([barStart, filledBar, emptyBar, barEnd].join(''));
   // ['▏', '████▊', '\u200b u200b u200b ', '▕'].join('')
   // should be: ''

   return [barStart, filledBar, emptyBar, barEnd].join('');
};

// console.log(drawBar(maxLength, portion));
// drawBar();

const longestString = array => {
   let longest = array[0];
   const length = array.length;

   for (let i = 0; i < length; i++) {
      if (longest.length < array[i].length) {
         longest = array[i];
      }
   }

   return longest;
};

const randomNumber = async limit => Math.floor(Math.random() * limit);

module.exports = {
   drawBlock,
   drawSpace,
   drawBar,
   longestString,
   randomNumber,
};
