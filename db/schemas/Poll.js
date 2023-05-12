const mongoose = require('mongoose');
const { model, Schema } = require('mongoose');

const { PollChannel } = require('../schemas/PollChannel');

const { log: l } = console;

// Building Up, start basic
const PollSchema = new Schema(
   {
      _id: Schema.Types.ObjectId,

      guildId: { type: String, required: true },

      creatorId: { type: String, required: true },

      messageId: { type: String, required: true },
      // allowance IMPLEMENT SOON
      // allowanceStrategy: {type: [String]}
      config: {
         type: Schema.Types.ObjectId,
         ref: 'channelConfig',
         required: true,
      },

      timeEnd: { type: Date, default: () => Date.now() + 5 * 60 * 1000 }, // add in default calc for Date.now() + pollDuration value
      pollData: {
         title: {
            type: String,
            required: true,
         },
         description: {
            type: String,
            default: '',
            // required: true,
         },
         voteAllowance: {
            type: Number,
            required: true,
            default: 1,
         },
         choices: {
            // Find a way to add validator for number of array entries
            type: [String],
            required: true,
         },
      },
      // todo Should maybe peak at this to check on whether or not I'm actually using this votes array. It would be more efficient and follow the Principles of Least Cardinality if I were to eleiminate this field entirely and then rely on the populate virtual to maintain these votes?
      votes: [
         {
            type: Schema.Types.ObjectId,
            ref: 'Vote',
            default: () => ({}),
         },
      ],
      abstains: {
         type: Map,
         of: Boolean,
         default: new Map(),
      },
      allowedUsers: {
         type: Map,
         of: Boolean,
         default: new Map(),
      },
      status: {
         type: String,
         default: 'closed',
         enum: ['open', 'closed', 'cancelled', 'canceled'],
      },
      pollSucceeded: {
         type: Boolean,
      },
      pollNumber: {
         type: Number,
      },
   },
   {
      timestamps: { createdAt: 'timeCreated', updatedAt: 'modified' },
      query: {
         // todo change this to now accomodate guildId as well? For multi-server shenanigans
         byMessageId(messageId) {
            l('FROM QUERY HELPER', { messageId });
            return this.where({ messageId: new RegExp(messageId, 'i') });
         },
      },
      statics: {
         async findAndSetAbstained(messageId, userId) {
            const updatedPoll = await this.findOneAndUpdate(
               { messageId },
               {
                  $set: {
                     [`allowedUsers.${userId}`]: true,
                     [`abstains.${userId}`]: true,
                  },
               },
               { new: true }
            ).exec();
            return updatedPoll;
         },
         async findAndSetVoted(messageId, userId) {
            const updatedPoll = await this.findOneAndUpdate(
               { messageId },
               {
                  $set: {
                     [`allowedUsers.${userId}`]: true,
                  },
               },
               { new: true }
            )
               .populate([
                  // { path: 'results' },
                  { path: 'config' },
                  { path: 'countVoters' },
                  { path: 'getVotes', select: 'choices -poll -_id' },
               ])
               .exec();
            return updatedPoll;
         },
         async createNewPoll(data, duration) {
            const newPoll = await this.create([data], { new: true }).then(
               docArray => docArray[0]
            );

            const timeEndMilli = new Date(
               newPoll.timeCreated.getTime() + duration
            );

            newPoll.timeEnd = timeEndMilli.toISOString();

            return await newPoll.save();
         },
      },
      methods: {
         async clearProperty(property) {
            const normalizedArgument = property.toLowerCase().trim();
            switch (true) {
               case normalizedArgument === 'allowedusers':
                  this.allowedUsers.clear();
                  break;
               case normalizedArgument === 'abstains':
                  this.abstains.clear();
            }
         },
         async pollOptions() {
            await this.populate('config');

            const options = await this.config.channelOptions();

            return options;
         },
      },
   }
);

// POPULATE VIRTUALS
// Simply counts to total votes on the Poll so far
PollSchema.virtual('countVoters', {
   ref: 'Vote',
   localField: '_id',
   foreignField: 'poll',
   count: true,
});
// retrieve list of vote choice arrays
PollSchema.virtual('getVotes', {
   ref: 'Vote',
   localField: '_id',
   foreignField: 'poll',
});

// VIRTUALS
PollSchema.virtual('countAbstains').get(function () {
   return this.abstains.size;
});

PollSchema.virtual('participation').get(function () {
   return parseFloat(
      (
         (((this.countVoters ?? 0) + (this.abstains.size ?? 0)) /
            this.allowedUsers.size) *
         100
      ).toFixed(2)
   );
});

PollSchema.virtual('voterQuorum').get(function () {
   // Add in an evaluation for a quorum of zero and make it use a %
   const voterQuorum = Math.ceil(
      this.allowedUsers.size * (this.config.quorum / 100)
   );

   console.log(
      '--------------------------------------\nFROM GETTER\nPoll.js -- virtual: voterQuorum\n---------------------------',
      { voterQuorum },
      this.config
   );

   return voterQuorum > 1 ? voterQuorum : 1;
});

PollSchema.virtual('voteThreshold').get(function () {
   const voteThreshold = Math.ceil(
      this.allowedUsers.size * (this.config.voteThreshold / 100)
   );

   console.log(
      '--------------------------------------\nFROM GETTER\nPoll.js -- virtual: voteThreshold\n---------------------------',
      { voteThreshold }
   );
   return voteThreshold > 1 ? voteThreshold : 1;
});

PollSchema.virtual('results').get(function () {
   const resultsObject = Object.create(null);
   resultsObject.distribution = Object.create(null);
   let len = this.pollData.choices.length;

   l('db/schemas/Poll.js => this.getVotes', this.getVotes ?? []);
   const flatVotes = this.getVotes?.flatMap(({ choices }) => choices) ?? [];
   l('db/schemas/Poll.js => flatVotes ?? []', flatVotes);

   let prevHighest = null;
   let leadingOption = null;
   let tiedLeads = [];

   for (let i = 0; i < len; i++) {
      let key = this.pollData.choices[i];
      let value = flatVotes.filter(choice => choice === key).length;

      // resultsObject[key] = value;
      resultsObject.distribution[key] = value;

      if (this.status === 'closed' && value === prevHighest) {
         // const
         if (!!tiedLeads.length) {
            tiedLeads.push([key, value]);
         } else {
            tiedLeads.push([leadingOption, prevHighest], [key, value]);
            leadingOption = key;
            prevHighest = value;
         }
      }

      if (value > prevHighest) {
         leadingOption = key;
         prevHighest = value;

         // only empty array if the poll is closed, no point calculating ties while it's open?...Shit that might not be true because of the quorum though? We'll see
         this.status === 'closed' && (tiedLeads = []);
      }
   }

   resultsObject.totalVotes = flatVotes.length;

   resultsObject.quorumPass =
      resultsObject.totalVotes + this.abstains.size >= this.voterQuorum
         ? true
         : false;

   // if (!tiedLeads.length) {
   //    resultsObject.thresholdPass =
   //       resultsObject.distribution[leadingOption] >= this.voteThreshold
   //          ? true
   //          : false;
   // } else {
   //    resultsObject.thresholdPass =
   //       resultsObject.tied[0][1] >= this.voteThreshold ? true : false;
   // }

   // resultsObject.thresholdPass =
   //    !tiedLeads.length &&
   //    resultsObject.distribution[leadingOption] >= this.voteThreshold
   //       ? true
   //       : false;

   console.log('Poll.js -- this.voterQuorum => ', this.voterQuorum);
   console.log('Poll.js -- this.voteThreshold => ', this.voteThreshold);
   console.log(
      'Poll.js -- resultsObject.quorumPass => ',
      resultsObject.quorumPass
   );
   console.log(
      'Poll.js -- resultsObject.thresholdPass => ',
      resultsObject.thresholdPass
   );

   if (!tiedLeads.length) {
      resultsObject.winner = leadingOption;

      resultsObject.thresholdPass =
         resultsObject.distribution[leadingOption] >= this.voteThreshold
            ? true
            : false;
   } else {
      resultsObject.tied = tiedLeads;

      resultsObject.thresholdPass =
         resultsObject.tied[0][1] >= this.voteThreshold ? true : false;
   }
   return resultsObject;
});

module.exports = model('Poll', PollSchema);
