// Package Dependencies
const { inlineCode, codeBlock } = require('@discordjs/builders');
require('dotenv').config();
const mongoose = require('mongoose');
// Personal Imports
const { drawBar, longestString } = require('../helpers/poll');
const ResultBar = require('../structures/ResultBar');
// const { encodeURI } = require('../utils/functions');
const Poll = require('../db/schemas/Poll');
const { lc } = require('../utils/functions');

const { log: l } = console;
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
         });
         DB.on('open', async () => {
            console.log('Connection open');

            const openPolls = await Poll.find({ status: 'open' })
               .populate('config', 'channelId')
               .then(foundPolls => {
                  const sortedPolls = foundPolls.sort(
                     (a, b) => a.timeEnd - b.timeEnd
                  );

                  const sortedPollsLogMap = sortedPolls.map(
                     ({ pollData, pollNumber, timeEnd, status }) => ({
                        pollData,
                        pollNumber,
                        timeEnd,
                        status,
                     })
                  );

                  lc(
                     'SORTED FOUND POLLS',
                     '131',
                     JSON.stringify(sortedPollsLogMap, null, 4)
                  );
                  return foundPolls.sort((a, b) => a.timeEnd - b.timeEnd);
               })
               .catch(err => console.error(err));

            // console.log({ openPolls });
            // createTest();
            // createChannelTest();

            client.on('enqueuePoll', newPoll => {
               // console.log('PRE PUSH AND SORT', { openPolls });
               // lc('PRE PUSH AND SORT\nopenPolls', '131', openPolls);

               openPolls.push(newPoll);
               openPolls.sort((a, b) => a.timeEnd - b.timeEnd);
               // console.log('POST PUSH AND SORT', { openPolls });
               // lc('POST PUSH AND SORT\nopenPolls', '132', openPolls);

               l('NEW POLL ADDED TO QUEUE -- NEW POLL LIST:');

               const sortedPollsLogMap = openPolls.map(
                  ({ pollData, pollNumber, timeEnd, status }) => ({
                     pollData,
                     pollNumber,
                     timeEnd,
                     status,
                  })
               );

               lc(
                  'POLL QUEUED -- NEW SORTED OPEN POLLS LIST',
                  '131',
                  JSON.stringify(sortedPollsLogMap, null, 4)
               );

               // openPolls.forEach(({ pollData, pollNumber, timeEnd, status }) =>
               //    lc(
               //       'FOUND POLL',
               //       '131',
               //       JSON.stringify(
               //          {
               //             pollData,
               //             pollNumber,
               //             timeEnd,
               //             status,
               //          },
               //          null,
               //          4
               //       )
               //    )
               // );

               intervalFunction();
            });

            client.on('dequeuePoll', oldPoll => {
               console.log('DEQUEUEING POLL:');

               lc(
                  'oldPoll',
                  '131',
                  JSON.stringify(
                     { pollData: oldPoll.pollData, timeEnd: oldPoll.timeEnd },
                     null,
                     4
                  )
               );
               // const idx = openPolls.findIndex(({ _id }) => {
               const idx = openPolls.findIndex(({ _id }) => {
                  console.log('_id', _id);
                  console.log('oldPoll ID', oldPoll._id);
                  // console.log('oldPoll', oldPoll);
                  // console.log('poll', poll);
                  return _id.equals(oldPoll._id);
                  // return poll._id.equals(oldPoll._id);
               });

               lc('idx', '132', idx);

               openPolls.splice(idx, 1);
               // console.log('TESTING POST REMOVED POLLS');

               const sortedPollsLogMap = openPolls.map(
                  ({ pollData, pollNumber, timeEnd, status }) => ({
                     pollData,
                     pollNumber,
                     timeEnd,
                     status,
                  })
               );

               lc(
                  'POLL DEQUEUED -- NEW OPEN POLLS LIST:',
                  '133',
                  JSON.stringify(sortedPollsLogMap, null, 4)
               );
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

                     if (!openPolls[0]) {
                        return clearInterval(intervalId);
                     }
                     console.log('\x1b[33m Welcome to the app! \x1b[0m');
                     console.log('NERPPPPROPR');
                     // console.log(`\x1b[43m${openPolls[0]}\x1b[0m`);
                     lc('openPolls[0]', '116', openPolls[0]);
                     const closingPoll =
                        (await Poll.findByIdAndUpdate(
                           openPolls[0]._id,
                           {
                              status: 'closed',
                           },
                           { new: true }
                        )
                           .populate([
                              {
                                 path: 'config',
                                 select: 'channelId quorum voteThreshold liveVisualFeed',
                              },
                              { path: 'countVoters' },
                              { path: 'getVotes' },
                           ])
                           .exec()) ?? null;

                     // todo Maybe try evaluating for whether or not this poll is already closed instead of trying to check for the presence of an existing message and checking if null
                     console.log('LOOKING FOR DELETED POLL THIS BE IT', {
                        closingPoll,
                     });

                     if (closingPoll !== null && closingPoll.config !== null) {
                        // todo consider whether or not this is better than using a channel messages.fetch()? perhaps using the fetch instead of the get() will affect this operation if the bot goes offline and this somehow clears the cache

                        console.log(
                           'closingPoll !== null && closingPoll.config !== null',
                           { closingPoll }
                        );
                        console.log(
                           'closingPoll !== null && closingPoll.config !== null',
                           closingPoll.config
                        );

                        console.log(
                           `closingPoll.messageId\n\n${closingPoll.messageId}`
                        );

                        const message = await (client.channels.cache
                           .get(closingPoll.config.channelId)
                           .messages.cache.get(closingPoll.messageId) ??
                           client.channels.cache
                              .get(closingPoll.config.channelId)
                              .messages.fetch(closingPoll.messageId));

                        console.log({ message });

                        if (message === null) {
                           return openPolls.shift();
                        }

                        const eligibleVoters = closingPoll.allowedUsers.size;

                        let winningResult = '';
                        const results = await closingPoll.results;

                        console.log({ results });

                        if ('winner' in results) {
                           console.log(results.winner);
                           winningResult =
                              results.winner !== null
                                 ? `${
                                      results.winner[0].toUpperCase() +
                                      results.winner.substring(1)
                                   } - Wins`
                                 : 'Literally nobody voted on this :<';
                        }

                        if ('tied' in results) {
                           winningResult = `${results.tied
                              .flatMap(
                                 arr =>
                                    arr[0][0].toUpperCase() +
                                    arr[0].substring(1)
                              )
                              .join(', ')} - Tied\nPoll inconclusive.`;

                           closingPoll.pollSucceeded = false;
                        }

                        let failedChecks = [];

                        // if (
                        //    results.quorumPass === true &&
                        //    results.thresholdPass === true
                        // ) {
                        // } else if (
                        //    results.quorumPass === true &&
                        //    results.thresholdPass === false
                        // ) {
                        // }

                        console.log(
                           'db/index.js -- jsfailedChecks before checks=> ',
                           failedChecks
                        );

                        if (results.quorumPass === false) {
                           failedChecks.push('quorum');
                        }

                        if (results.thresholdPass === false) {
                           failedChecks.push('vote threshold');
                        }

                        console.log(
                           'db/index.js -- jsfailedChecks after checks=> ',
                           failedChecks
                        );

                        console.log(
                           'db/index.js -- closingPoll.pollSucceeded PRE checks => ',
                           closingPoll.pollSucceeded
                        );

                        if (failedChecks.length) {
                           closingPoll.pollSucceeded = false;
                           winningResult = `Poll failed to meet ${failedChecks.join(
                              ' and '
                           )}.`;
                        } else {
                           closingPoll.pollSucceeded = true;
                        }

                        console.log(
                           'db/index.js -- closingPoll.pollSucceeded POST checks => ',
                           closingPoll.pollSucceeded
                        );

                        await closingPoll.save();

                        console.log(
                           'index.js -- winningResult after checks => ',
                           winningResult
                        );

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

                        // todo Extract code into module

                        // const longestOption = longestString(options).length;
                        const longestOption = longestString(
                           closingPoll.pollData.choices
                        ).length;

                        console.log(
                           'db/index.js -- longestOption => ',
                           longestOption
                        );
                        // let resultsArray = ['```', '```'];
                        let resultsArray = closingPoll.config.voteThreshold
                           ? [
                                `Threshold: ${closingPoll.voteThreshold} ${
                                   closingPoll.voteThreshold > 1
                                      ? 'votes'
                                      : 'vote'
                                }\n`,
                             ]
                           : [];
                        let resultsOutput = [];

                        const barWidth = 8;
                        let totalVotes = closingPoll.results.totalVotes;

                        let votesMap = new Map([
                           ['maxLength', barWidth],
                           ['totalVotes', totalVotes],
                        ]);

                        for (const key in results.distribution) {
                           const label =
                              key[0].toUpperCase() + key.substring(1);

                           console.log('db/index.js -- label => ', label);
                           console.log(
                              'db/index.js -- label.length => ',
                              label.length
                           );
                           console.log(
                              'db/index.js -- logging :  longestOption - label.length => ',
                              longestOption - label.length
                           );
                           const votes = results.distribution[key];
                           const room = longestOption - label.length;
                           let optionObj = new ResultBar(
                              label,
                              votes,
                              room,
                              votesMap
                           );

                           console.log('optionObj => ', optionObj);
                           console.log(
                              'optionObj.completeBar => ',
                              optionObj.completeBar
                           );

                           //disabled for testing
                           // let optionObj = {
                           //    label,
                           //    votes: results.distribution[key],
                           //    room: longestOption - label.length,
                           //    get spacer() {
                           //       return this.room !== 0
                           //          ? Array.from(
                           //               { length: this.room },
                           //               () => '\u200b '
                           //            ).join('')
                           //          : '';
                           //    },
                           //    get portion() {
                           //       return votesMap.get('totalVotes') !== 0
                           //          ? this.votes / votesMap.get('totalVotes')
                           //          : 0;
                           //    },
                           //    get portionOutput() {
                           //       // return ` ${(this.portion * 100).toFixed(1)}%`;
                           //       return ` ${this.votes ?? 0} votes`;
                           //    },
                           //    get bar() {
                           //       return drawBar(
                           //          votesMap.get('maxLength'),
                           //          this.portion
                           //       );
                           //    },
                           //    get completeBar() {
                           //       return [
                           //          `${this.label}${this.spacer} `,
                           //          this.bar,
                           //          this.portionOutput,
                           //       ].join('');
                           //    },
                           // };

                           votesMap.set(label, optionObj);
                           // resultsArray.splice(-1, 0, optionObj.completeBar);
                           resultsArray.push(optionObj.completeBar);
                        }

                        resultsArray.push(
                           `\nAbstains: ${closingPoll.abstains.size}`
                        );

                        // console.log(votesMap);

                        // resultsOutput = resultsArray.join('\n');
                        resultsOutput = codeBlock(resultsArray.join('\n'));
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
                        console.log({ closedEmbed });

                        closedEmbed.setTitle(`${closedEmbed.title}`);

                        console.log({ closedEmbed });
                        console.log(
                           'closingPoll.config.voteThreshold => ',
                           closingPoll.config.voteThreshold
                        );

                        const votersValue = `Quorum: ${
                           closingPoll.voterQuorum
                        }\n\nParticipated: ${
                           closingPoll.countVoters + closingPoll.countAbstains
                        }\nEligible: ${eligibleVoters}`;

                        // const votersValue = closingPoll.config.voteThreshold
                        //    ? `Quorum: ${
                        //         closingPoll.voterQuorum
                        //      }\n\nParticipated: ${
                        //         closingPoll.countVoters +
                        //         closingPoll.countAbstains
                        //      }\nEligible: ${eligibleVoters}`
                        //    : `Quorum: ${
                        //         closingPoll.voterQuorum
                        //      }\n\nParticipated: ${
                        //         closingPoll.countVoters +
                        //         closingPoll.countAbstains
                        //      }\nEligible: ${eligibleVoters}`;

                        const closedFields = [
                           {
                              name: 'RESULTS',
                              value: codeBlock(winningResult),
                              inline: false,
                           },
                           {
                              name: 'VOTES',
                              value: resultsOutput,
                              inline: false,
                           },
                           {
                              name: 'VOTERS',
                              value: codeBlock(votersValue),
                              // value: codeBlock(
                              //    `Quorum: ${
                              //       closingPoll.voterQuorum
                              //    }\n\nParticipated: ${
                              //       closingPoll.countVoters +
                              //       closingPoll.countAbstains
                              //    }\nEligible: ${eligibleVoters}\n\nParticipation Rate: ${
                              //       closingPoll.participation
                              //    }%`
                              // ),
                              // value: codeBlock(
                              //    `Quorum: ${closingPoll.voterQuorum}\n\nEligible: ${eligibleVoters}\nSubmitted: ${closingPoll.countVoters}\nAbstained: ${closingPoll.countAbstains}\n\nParticipation Rate: ${closingPoll.participation}%`
                              // ),
                              inline: false,
                           },
                        ];

                        console.log(
                           'closingPoll.config => ',
                           closingPoll.config
                        );
                        console.log(
                           'closingPoll.config.liveVisualFeed => ',
                           closingPoll.config.liveVisualFeed
                        );
                        console.log(
                           'closingPoll.config.liveVisualFeed === true => ',
                           closingPoll.config.liveVisualFeed === true
                        );

                        if (closingPoll.config.liveVisualFeed === true) {
                           console.log('REMOVING FIELDS');
                           console.log(closedEmbed);
                           closedEmbed.spliceFields(1, 5, closedFields);
                        } else {
                           console.log('NOT REMOVING FIELDS');
                           console.log(closedEmbed);
                           closedEmbed.spliceFields(1, 4, closedFields);
                        }

                        console.log('closedEmbed.fields');
                        console.log(closedEmbed.fields);

                        message.edit({
                           content: null,
                           embeds: [closedEmbed],
                           components: [],
                        });

                        console.log({ closedEmbed });

                        console.log(
                           'closingPoll.results.tied => ',
                           closingPoll.results.tied
                        );
                        // })
                        // .catch(err => console.error(err));
                     } else if (
                        closingPoll !== null &&
                        closingPoll.config === null
                     ) {
                        console.log('ClosingPoll present but config is null', {
                           closingPoll,
                        });
                        const message = await client.channels.cache;
                        // .get(closingPoll.config.channelId)
                        // .messages.fetch(closingPoll.messageId);
                        console.log({ message });
                     }

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
            // background: ESC[48;5;#m
            // console.log(`openPolls\n\x1b[48;5;162m${openPolls}\x1b[0m`);
            // console.log(`openPolls\n\x1b[46m${openPolls}\x1b[0m`);
         });
         await mongoose.connect(mongoURI, options);

         // console.log('DB/index.js', { DB });
      } catch (error) {
         console.error(error);
      }
   })();
};
