const { model, Schema, Types } = require('mongoose');
const PollChannel = require('./PollChannel');
const Poll = require('./Poll');

const Logger = require('../../helpers/logger');

const userSchema = new Schema(
   {
      _id: Schema.Types.ObjectId,
      guildId: { type: String, required: true },
      discordId: {
         type: String,
         required: true,
         unique: false,
      },
      // todo I'm going to need to maybe add in a guildId to this to differentiate users... or perhaps change the eligible channels map to have guildId as parent keys and then channels as a sub-map to those keys
      nameHistory: {
         type: [String],
      },
      eligibleChannels: {
         type: Map,
         of: Schema.Types.Mixed,
         default: new Map(),
      },
      // todo add a way to have user's status change to inactive when they leave the Discord server
      status: {
         type: String,
         enum: ['active', 'inactive', 'warning'],
         default: 'active',
      },
      username: {
         type: Schema.Types.String,
         required: false,
      },
   },
   {
      // comment
      timestamps: { createdAt: 'timeCreated', updatedAt: 'modified' },
      statics: {
         async createUser(guildId, voterId, eligibleChannels) {
            try {
               const eligibleMap = new Map();

               for (const channel of eligibleChannels) {
                  const polls = await Poll.aggregate([
                     {
                        $match: {
                           [`config`]: channel._id,
                           [`allowedUsers.${voterId}`]: { $exists: true },
                        },
                     },
                  ]).exec();

                  const statsObject = {
                     eligiblePolls: polls.length,
                     participatedPolls: polls.filter(
                        ({ allowedUsers }) => allowedUsers[voterId] === true,
                     ).length,
                  };

                  Logger.debug(
                     'db/schemas/User.js: In user static create user.',
                     {
                        guildId: guildId,
                        voterId: voterId,
                        eligibleChannels: eligibleChannels,
                        statsObject: statsObject,
                     },
                  );

                  eligibleMap.set(channel.channelId, statsObject);
               }

               return await this.create({
                  _id: new Types.ObjectId(),
                  guildId: guildId,
                  discordId: voterId,
                  eligibleChannels: eligibleMap,
               });
            } catch (error) {
               Logger.error('db/schemas/User.js: Retrieved an error ' + error, {
                  guildId: guildId,
                  voterId: voterId,
                  eligibleChannels: eligibleChannels,
               });
            }
         },
         async checkVotingRoles(memberRoles) {
            const hasVotingRoles = await PollChannel.countDocuments({
               allowedRoles: { $in: [...memberRoles.keys()] },
            }).exec();

            return !!hasVotingRoles;
         },
         async findEligibleChannels(memberRoles, anon = false) {
            if (!anon) {
               Logger.debug(
                  'db/schemas/User.js: Checking member role keys in User.findEligibleChannels()',
                  {
                     memberRolesKeys: [...memberRoles.keys()],
                     anon: anon,
                  },
               );
            }
            const eligibleChannels = await PollChannel.find({
               allowedRoles: { $in: [...memberRoles.keys()] },
            });

            if (!eligibleChannels)
               throw new Error('User is not eligible to vote in any channels.');

            return eligibleChannels;
         },
         async logAttr() {
            console.log(this.schema.statics);
            console.log(this.schema.methods);
            console.log(this.schema.query);
         },
         async userExists(guildId, discordId, anon = false) {
            Logger.info('db/schemas/User.js: In User.userExists()', {
               anon: anon,
            });

            if (!anon) {
               Logger.debug(
                  'db/schemas/User.js: In User.userExists(). Logging extra info if not anonymous.',
                  {
                     anon: anon,
                     guildId: guildId,
                     discordId: discordId,
                  },
               );
            }

            const userDoc = await model('User')
               .findOne()
               .byDiscordId(discordId, guildId)
               .exec();

            if (!anon) {
               Logger.debug(
                  'db/schemas/User.js: In User.userExists(). Checking user doc if not anonymous.',
                  {
                     anon: anon,
                     userDoc: userDoc,
                  },
               );
            }

            Logger.debug(
               'db/schemas/User.js: In User.userExists(). Check if a user doc was found.',
               {
                  hasFoundUserDoc: !!userDoc,
               },
            );

            return userDoc;
         },
         async updateUserParticipation(newPoll, guildId) {
            Logger.debug('db/schemas/User.js: Updating user participation.', {
               guildId,
               channelId: newPoll.config.channelId,
            });

            const discordUserIds = [...newPoll.allowedUsers.keys()];
            return discordUserIds.map(async discordUserId => {
               let user = await this.findOne({
                  guildId: guildId,
                  discordId: discordUserId,
               });

               if (!user) {
                  Logger.debug('db/schemas/User.js: Creating missing user.', {
                     guildId,
                     channelId: newPoll.config.channelId,
                  });

                  user = new this({
                     _id: new Types.ObjectId(),
                     guildId: guildId,
                     discordId: discordUserId,
                     eligibleChannels: new Map(),
                  });
               }

               if (!user.eligibleChannels) {
                  user.eligibleChannels = new Map();
               }

               if (user.eligibleChannels.has(newPoll.config.channelId)) {
                  user.eligibleChannels.get(newPoll.config.channelId)
                     .eligiblePolls++;
               } else {
                  user.eligibleChannels.set(newPoll.config.channelId, {
                     eligiblePolls: 1,
                     participatedPolls: 0,
                  });
               }

               user.markModified('eligibleChannels');
               return user.save();
            });
         },
      },
      methods: {
         async participation(channelId) {
            const { eligibleChannels } = this;
            const eligibleHere = eligibleChannels.has(channelId);

            if (!eligibleHere)
               return 'User is not eligible to vote in this channel.';

            // todo make sure that calculating -- IN THE FUTURE -- the participation leaves out polls that are not yet closed.
            const { eligiblePolls, participatedPolls } = eligibleChannels.get(
               channelId,
            )
               ? eligibleChannels.get(channelId)
               : null;

            Logger.debug(
               'db/schemas/User.js: Checking participation percentage.',
               {
                  channelId: channelId,
                  participationPercentage: Math.round(
                     (participatedPolls / eligiblePolls) * 100,
                  ).toFixed(2),
               },
            );

            if (eligiblePolls === 0)
               return 'User has not yet been a party to an eligible poll';
            if (participatedPolls === 0) return '0%';

            return `${Math.round(
               (participatedPolls / eligiblePolls) * 100,
            ).toFixed(2)}%`;
         },
         async incParticipation(channelId, configId, anon = false) {
            Logger.debug('db/schemas/User.js: Checking channelId', {
               channelId: channelId,
               configId: configId,
               anon: anon,
               notEligibleChannelsHaveId: !this.eligibleChannels.has(channelId),
            });

            try {
               if (!this.eligibleChannels.has(channelId)) {
                  Logger.warn(
                     "db/schemas/User.js: Channel key doesn't exist. Creating a new participation object.",
                     {
                        channelId: channelId,
                        configId: configId,
                        anon: anon,
                     },
                  );

                  // if configId is not provided in the code, we find and return it with a query
                  configId = configId
                     ? configId
                     : await PollChannel.findOne({ channelId }, '_id')
                          .lean()
                          .then(({ _id }) => _id);

                  const eligiblePolls = await Poll.aggregate([
                     {
                        $match: {
                           [`config`]: configId,
                           [`allowedUsers.${this.discordId}`]: {
                              $exists: true,
                           },
                        },
                     },
                  ]).exec();

                  const participationObject = {
                     eligiblePolls: eligiblePolls.length,
                     participatedPolls: eligiblePolls.filter(
                        ({ allowedUsers }) =>
                           allowedUsers[this.discordId] === true,
                     ).length,
                  };

                  if (!anon) {
                     Logger.debug(
                        'db/schemas/User.js: Checking new participation object.',
                        {
                           channelId: channelId,
                           configId: configId,
                           anon: anon,
                           participationObject: participationObject,
                        },
                     );
                  }

                  await this.updateOne(
                     {
                        $set: {
                           [`eligibleChannels.${channelId}`]:
                              participationObject,
                        },
                     },
                     { new: true },
                  ).exec();
               } else {
                  const newParticipation = this.eligibleChannels.get(channelId);

                  if (!anon) {
                     Logger.debug(
                        'db/schemas/User.js: Channel participation before increment.',
                        {
                           channelId: channelId,
                           configId: configId,
                           anon: anon,
                           participationObject: newParticipation,
                        },
                     );
                  }

                  newParticipation.participatedPolls++;

                  // this.markModified('eligibleChannels');
                  await this.updateOne(
                     {
                        $set: {
                           [`eligibleChannels.${channelId}`]: newParticipation,
                        },
                     },
                     { new: true },
                  ).exec();

                  if (!anon) {
                     Logger.debug(
                        'db/schemas/User.js: Channel participation after increment.',
                        {
                           channelId: channelId,
                           configId: configId,
                           anon: anon,
                           participationObject:
                              this.eligibleChannels.get(channelId),
                        },
                     );
                  }
               }
            } catch (error) {
               Logger.error('db/schemas/User.js: Error.', {
                  error: error,
               });
            }
            return;
         },
      },
      query: {
         byDiscordId(discordId, guildId) {
            try {
               return this.where({
                  discordId: new RegExp(discordId, 'i'),
                  guildId: new RegExp(guildId, 'i'),
               });
            } catch (error) {
               Logger.error('db/schemas/User.js: Error.', {
                  error: error,
               });
               throw new Error(
                  `Unable to fulfill member lookup:\n INFO:\n${error.message}`,
               );
            }
         },
      },
   },
);

// userSchema.virtual('getVotes', {
//    ref: 'Vote',
//    localField: '_id',
//    foreignField: 'userNested',
// });

//Export the model
module.exports = model('User', userSchema);
