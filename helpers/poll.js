// Globals
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
   const length = portion * maxLength;
   const completeBlocks = Math.floor(length);
   const fracPart = length - completeBlocks;
   const fracIndex = Math.round(fracPart / step);
   const filledBar = drawBlock(fracIndex, completeBlocks);
   const emptySpace = maxLength - filledBar.length;
   const emptyBar = drawSpace(emptySpace);

   // console.log([barStart, filledBar, emptyBar, barEnd].join(''));

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
   drawBar,
   longestString,
};
