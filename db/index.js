// Package Dependencies
const { inlineCode, codeBlock } = require('@discordjs/builders');
require('dotenv').config();
const mongoose = require('mongoose');
// Personal Imports
const { drawBar, longestString } = require('../helpers/poll');
// const { encodeURI } = require('../utils/functions');
const Poll = require('../db/schemas/Poll');

// const {
//    createPollTest,
// } = require('../scratchcode/db/schema/testExecutions/createPoll');

module.exports = async client => {
   // const usernameSegment = encodeURI(process.env.MONGODB_DEV_USER);
   // const passwordSegment = encodeURI(process.env.MONGODB_DEV_PASSWORD);
   // const mongoCloudURI = process.env.MONGODB_URI_BASE.replace(
   //    /<username>/,
   //    usernameSegment
   // ).replace(/<password>/, passwordSegment);

   // disabled Nerman-Dev-Jr stuff
   // const mongoURI =
   //    process.env.DB_ENV === 'Cloud'
   //       ? mongoCloudURI
   //       : 'mongodb://localhost:27017/polls-test';

   const mongoURI =
      process.env.NODE_ENV === 'production'
         ? process.env.MONGODB_URI
         : 'mongodb://localhost:27017/polls-test';

   // create empty options object
   const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      heartbeatFrequencyMS: 10000,
   };

   // Turn off auto indexing in production, because it's expensive on performance
   if (process.env.NODE_ENV === 'production') {
      options.autoIndex = false;
      options.keepAlive = true; // this is true by default since v5.2.0 but keeping it as a reminder
      options.keepAliveInitialDelay = 300000;
   }
   console.log({ options });

   (async () => {
      try {
         const DB = mongoose.connection;

         DB.on('error', err => {
            // logError(err);
            console.error({ err });
         });

         DB.on('connected', () => {
            console.log('Connected to DB');

            console.group('connectTest');
            console.log(
               '*******************************************************'
            );
            console.log('closingPoll.allowedUsers.size');
            console.log('closingPoll.countVoters');
            console.log('closingPoll.participation');
            console.log(
               '*******************************************************'
            );
            console.groupEnd('connectTest');
         });
         DB.on('open', async () => {
            console.log('Connection open');

            const openPolls = await Poll.find({ status: 'open' })
               .populate('config', 'channelId')
               .then(foundPolls => {
                  console.log({ foundPolls });
                  return foundPolls.sort((a, b) => a.timeEnd - b.timeEnd);
               })
               .catch(err => console.error(err));
            // createTest();
            // createChannelTest();

            client.on('queuePoll', newPoll => {
               console.log('PRE PUSH AND SORT', { openPolls });
               openPolls.push(newPoll);
               openPolls.sort((a, b) => a.timeEnd - b.timeEnd);
               console.log('POST PUSH AND SORT', { openPolls });
               intervalFunction();
            });
            let intervalId;

            // if (openPolls.length) {
            const intervalFunction = () => {
               if (intervalId) {
                  clearInterval(intervalId);
               }
               let currentTime = Date.now();
               let endTime = openPolls[0].timeEnd.getTime();

               intervalId = setInterval(async () => {
                  currentTime += 1000;
                  // console.log(endTime - currentTime);
                  // console.log({ endTime });

                  // console.log(endTime < currentTime);

                  if (endTime < currentTime) {
                     // return;
                     const closingPoll = await Poll.findByIdAndUpdate(
                        openPolls[0]._id,
                        {
                           status: 'closed',
                        },
                        { new: true }
                     )
                        .populate([
                           { path: 'config', select: 'channelId quorum' },
                           { path: 'countVoters' },
                           { path: 'getVotes' },
                        ])
                        .exec();
                     console.group('closingPoll');
                     console.log(
                        '*******************************************************'
                     );
                     console.log(closingPoll.allowedUsers.size);
                     console.log(closingPoll.countVoters);
                     console.log(closingPoll.participation);
                     console.log(
                        '*******************************************************'
                     );
                     console.groupEnd('closingPoll');

                     const message = await client.channels.cache
                        .get(closingPoll.config.channelId)
                        .messages.fetch(closingPoll.messageId);
                     // const message = await client.channels.cache
                     //    .get(foundPoll.config.channelId)
                     //    .messages.fetch(foundPoll.messageId);

                     const eligibleVoters = closingPoll.allowedUsers.size;

                     let winningResult = '';
                     const results = await closingPoll.results;

                     console.log({ results });
                     // console.log(results.hasOwnProperty('winner'));
                     // console.log('winner' in results);
                     // console.log('tied' in results);
                     // console.log(results.hasOwn('tied'));
                     // console.log(results.getOwnPropertyNames());
                     // console.log(results.keys());

                     if ('winner' in results) {
                        console.log(results.winner);
                        winningResult =
                           results.winner !== null
                              ? `${results.winner} - Wins`
                              : 'Literally nobody voted on this :<';
                     }

                     if ('tied' in results) {
                        winningResult = `${results.tied
                           .flatMap(arr => arr[0])
                           .join(', ')} - Tied`;
                     }

                     //
                     //
                     //
                     //
                     //
                     //
                     //
                     //
                     //
                     //
                     //

                     // const longestOption = longestString(options).length;
                     const longestOption = longestString(
                        closingPoll.pollData.choices
                     ).length;
                     let resultsArray = ['```', '```'];
                     let resultsOutput = [];

                     const barWidth = 8;
                     let totalVotes = closingPoll.results.totalVotes;

                     let votesMap = new Map([
                        ['maxLength', barWidth],
                        ['totalVotes', totalVotes],
                     ]);
                     for (const key in results.distribution) {
                        const label = key;
                        let optionObj = {
                           label,
                           votes: results.distribution[key],
                           room: longestOption - label.length,
                           get spacer() {
                              return this.room !== 0
                                 ? Array.from(
                                      { length: this.room },
                                      () => '\u200b '
                                   ).join('')
                                 : '';
                           },
                           get portion() {
                              return votesMap.get('totalVotes') !== 0
                                 ? this.votes / votesMap.get('totalVotes')
                                 : 0;
                           },
                           get portionOutput() {
                              // return ` ${(this.portion * 100).toFixed(1)}%`;
                              return ` ${this.votes ?? 0} votes`;
                           },
                           get bar() {
                              return drawBar(
                                 votesMap.get('maxLength'),
                                 this.portion
                              );
                           },
                           get completeBar() {
                              return [
                                 `${this.label}${this.spacer} `,
                                 this.bar,
                                 this.portionOutput,
                              ].join('');
                           },
                        };

                        votesMap.set(label, optionObj);
                        resultsArray.splice(-1, 0, optionObj.completeBar);
                     }

                     // console.log(votesMap);

                     resultsOutput = resultsArray.join('\n');
                     //
                     //
                     //
                     //
                     //
                     //
                     //
                     //
                     //
                     //
                     //
                     //

                     let closedEmbed = message.embeds[0];

                     const closedFields = [
                        {
                           name: 'Voters',
                           value: codeBlock(
                              `Quorum: ${closingPoll.voterQuorum}\n\nEligible Voters: ${eligibleVoters}\nSubmitted a Vote: ${closingPoll.countVoters}\nAbstains: ${closingPoll.countAbstains}\n\nParticipation Rate: ${closingPoll.participation}%`
                           ),
                           inline: false,
                        },
                        {
                           name: 'Votes',
                           value: resultsOutput,
                           // value: codeBlock(
                           //    `Imagine some bars here\n --------`
                           // ),
                           inline: false,
                        },
                        {
                           name: 'Result',
                           value: codeBlock(winningResult),
                           inline: false,
                        },
                     ];

                     closedEmbed.spliceFields(0, 4, closedFields);
                     console.log('closedEmbed.fields');
                     console.log(closedEmbed.fields);

                     message.edit({
                        content: 'Poll closed.',
                        embeds: [closedEmbed],
                        components: [],
                     });

                     console.log({ closedEmbed });
                     // })
                     // .catch(err => console.error(err));

                     openPolls.shift();

                     // console.log(openPolls[0]?.timeEnd ?? 'no time');

                     console.log({ endTime });
                     if (openPolls.length) {
                        endTime = openPolls[0].timeEnd.getTime();
                     } else {
                        clearInterval(intervalId);
                     }
                     console.log({ endTime });
                  }
               }, 1000);
               // };
            };

            if (openPolls.length) {
               intervalFunction();
            }

            console.log({ openPolls });
         });
         await mongoose.connect(mongoURI, options);

         // console.log('DB/index.js', { DB });
      } catch (error) {
         console.error(error);
      }
   })();
};
