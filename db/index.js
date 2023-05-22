// Package Dependencies
const { inlineCode, codeBlock } = require('@discordjs/builders');
require('dotenv').config();
const mongoose = require('mongoose');
// Personal Imports
const { drawBar, longestString } = require('../helpers/poll');
const Logger = require('../helpers/logger');
const ResultBar = require('../classes/ResultBar');

const Poll = require('../db/schemas/Poll');
const { lc } = require('../utils/functions');

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
   Logger.info('db/index.js: Checking options.', {
      options: options,
   });

   (async () => {
      try {
         const DB = mongoose.connection;

         DB.on('error', err => {
            Logger.error('db/index.js: Database error.', { error: err });
         });

         DB.on('connected', () => {
            Logger.info('db/index.js: Connected to database.');
         });
         DB.on('open', async () => {
            Logger.info('db/index.js: Database is open.');

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

                  return foundPolls.sort((a, b) => a.timeEnd - b.timeEnd);
               })
               .catch(err =>
                  Logger.error(
                     'db/index.js: Encountered an error in the index.',
                     {
                        error: err,
                     }
                  )
               );

            client.on('enqueuePoll', newPoll => {
               openPolls.push(newPoll);
               openPolls.sort((a, b) => a.timeEnd - b.timeEnd);

               const sortedPollsLogMap = openPolls.map(
                  ({ pollData, pollNumber, timeEnd, status }) => ({
                     pollData,
                     pollNumber,
                     timeEnd,
                     status,
                  })
               );

               Logger.info('db/index.js: New poll added to queue', {
                  sortedPollsLogMap: sortedPollsLogMap,
               });

               intervalFunction();
            });

            client.on('dequeuePoll', oldPoll => {
               Logger.info('db/index.js: Dequeuing old poll.', {
                  pollData: oldPoll.pollData,
                  timeEnd: oldPoll.timeEnd,
               });

               const idx = openPolls.findIndex(({ _id }) => {
                  Logger.debug('db/index.js: Finding id.', {
                     id: _id,
                     oldPollId: oldPoll._id,
                  });

                  return _id.equals(oldPoll._id);
               });

               openPolls.splice(idx, 1);

               const sortedPollsLogMap = openPolls.map(
                  ({ pollData, pollNumber, timeEnd, status }) => ({
                     pollData,
                     pollNumber,
                     timeEnd,
                     status,
                  })
               );

               Logger.info('db/index.js: Poll dequeued. New open polls list.', {
                  sortedPollsLogMap: sortedPollsLogMap,
               });
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

                  if (endTime < currentTime) {
                     if (!openPolls[0]) {
                        return clearInterval(intervalId);
                     }

                     Logger.info(
                        'db/index.js: Inside interval function. Welcome to the app.'
                     );

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
                     Logger.debug('db/index.js: Looking for deleted poll.', {
                        closingPoll: closingPoll,
                     });

                     if (closingPoll !== null && closingPoll.config !== null) {
                        // todo consider whether or not this is better than using a channel messages.fetch()? perhaps using the fetch instead of the get() will affect this operation if the bot goes offline and this somehow clears the cache

                        Logger.debug(
                           "db/index.js: When closing poll isn't null and neither is the config.",
                           {
                              closingPoll: closingPoll,
                              config: closingPoll.config,
                              messageId: closingPoll.messageId,
                           }
                        );

                        const message = await (client.channels.cache
                           .get(closingPoll.config.channelId)
                           .messages.cache.get(closingPoll.messageId) ??
                           client.channels.cache
                              .get(closingPoll.config.channelId)
                              .messages.fetch(closingPoll.messageId));

                        Logger.debug('db/index.js: Message.', {
                           message: message,
                        });

                        if (message === null) {
                           return openPolls.shift();
                        }

                        const eligibleVoters = closingPoll.allowedUsers.size;

                        let winningResult = '';
                        const results = await closingPoll.results;

                        Logger.debug('db/index.js: Closing poll results.', {
                           results: results,
                        });

                        if ('winner' in results) {
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

                        Logger.debug('db/index.js: Before failed checks.', {
                           failedChecks: failedChecks,
                        });

                        if (results.quorumPass === false) {
                           failedChecks.push('quorum');
                        }

                        if (results.thresholdPass === false) {
                           failedChecks.push('vote threshold');
                        }
                        Logger.debug(
                           'db/index.js: After failed checks. Before conclusive checks.',
                           {
                              failedChecks: failedChecks,
                              conclusive: closingPoll.conclusive,
                           }
                        );

                        if (failedChecks.length) {
                           closingPoll.pollSucceeded = false;
                           winningResult = `Poll failed to meet ${failedChecks.join(
                              ' and '
                           )}.`;
                        } else {
                           closingPoll.pollSucceeded = true;
                        }

                        Logger.debug(
                           'db/index.js: After failed checks. After conclusive checks.',
                           {
                              failedChecks: failedChecks,
                              conclusive: closingPoll.conclusive,
                           }
                        );

                        await closingPoll.save();

                        const longestOption = longestString(
                           closingPoll.pollData.choices
                        ).length;

                        Logger.debug('db/index.js: Longest option.', {
                           longestOption: longestOption,
                        });

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

                           Logger.debug('db/index.js: Checking label.', {
                              label: label,
                              labelLength: label.length,
                              distanceFromLongest: longestOption - label.length,
                           });
                          
                           const votes = results.distribution[key];
                           const room = longestOption - label.length;
                           let optionObj = new ResultBar(
                              label,
                              votes,
                              room,
                              votesMap
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
                        resultsOutput = codeBlock(resultsArray.join('\n'));

                        let closedEmbed = message.embeds[0];

                        closedEmbed.setTitle(`${closedEmbed.title}`);

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
                              inline: false,
                           },
                        ];
                        
                         console.log('closingPoll.config => ', closingPoll.config)
                         console.log('closingPoll.config.liveVisualFeed => ', closingPoll.config.liveVisualFeed)
                        
// +                        if(closingPoll.config.liveVisualFeed === true) {
// +                           console.log('REMOVING FIELDS');
// +                           console.log(closedEmbed);
// +                           closedEmbed.spliceFields(1, 5, closedFields);
// +                        } else {
// +                           console.log('NOT REMOVING FIELDS');
// +                           console.log(closedEmbed);
// +                           closedEmbed.spliceFields(1, 4, closedFields);
// +                        }

//                         closedEmbed.spliceFields(1, 4, closedFields);

                        Logger.debug('db/index.js: Checking closed Embed.', {
                           closedEmbedField: closedEmbed.fields,
                        });

                        message.edit({
                           content: null,
                           embeds: [closedEmbed],
                           components: [],
                        });

                     } else if (
                        closingPoll !== null &&
                        closingPoll.config === null
                     ) {
                        const message = await client.channels.cache;

                        Logger.debug(
                           'db/index.js: Closing poll is present, but the config is null.',
                           {
                              closingPoll,
                              message,
                           }
                        );
                     }

                     openPolls.shift();

                     Logger.debug('db/index.ks: Logging end time.', {
                        endTime,
                     });

                     if (openPolls.length) {
                        endTime = openPolls[0].timeEnd.getTime();
                     } else {
                        clearInterval(intervalId);
                     }

                     Logger.debug('db/index.ks: Logging end time. Again.', {
                        endTime,
                     });
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
      } catch (error) {
         Logger.error('db/index.js', { error: error });
      }
   })();
};
