const { drawBar } = require('../helpers/poll');
module.exports = class ResultBar {
   constructor(label, votes, room, votesMap) {
      this.label = label;
      this.votes = votes;
      this.room = room;
      this.totalVotes = votesMap.get('totalVotes');
      this.maxLength = votesMap.get('maxLength');
   }

   get spacer() {
      console.log('this.room => ', this.room);
      return this.room !== 0
         ? Array.from({ length: this.room }, () => '\u200b ').join('')
         : '';
   }

   get portion() {
      return this.totalVotes !== 0 ? this.votes / this.totalVotes : 0;
      // return this.votesMap.get('totalVotes') !== 0
      //    ? this.votes / this.votesMap.get('totalVotes')
      //    : 0;
   }

   get portionOutput() {
      // return ` ${(this.portion * 100).toFixed(1)}%`;
      return ` ${this.votes ?? 0} votes`;
   }

   get bar() {
      return drawBar(this.maxLength, this.portion);
      // return drawBar(this.votesMap.get('maxLength'), this.portion);
   }

   get completeBar() {
      return [
         `${this.label}${this.spacer} `,
         this.bar,
         this.portionOutput,
      ].join('');
   }
};
