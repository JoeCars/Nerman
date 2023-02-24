const { model, Schema, Types } = require('mongoose');
const PollChannel = require('./PollChannel');
const Poll = require('./Poll');
const { log: l, trace: tr, error: lerr, group: gr, groupEnd: grE } = console;

const userSchema = new Schema(
   {
      _id: Schema.Types.ObjectId,
      // discordId: {
      //    type: String,
      //    required: true,
      //    unique: true,
      // },
      guildId: { type: String, required: true },
      discordId: {
         type: String,
         required: true,
         unique: false,
         validate: {
            validator: async function (discordId) {
               gr('User - discordId validator');
               const userExists = await this.schema.statics.userExists(
                  this.guildId,
                  discordId
               );

               // tr({ userExists });

               // l('this => :\n', this);
               // l('userExists => :\n', userExists);
               l('this.equals(userExists) :\n', this.equals(userExists));

               grE('User - discordId validator');
               if (userExists === null) {
                  return true;
               }

               if (this.equals(userExists)) {
                  return true;
               } else {
                  return false;
               }
               return !userExists;
            },
            message: `User document with:\nguildId => ${this.guildId}\ndiscordId => ${this.discordId}\nAlready exists.`,
         },
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
                        ({ allowedUsers }) => allowedUsers[voterId] === true
                     ).length,
                  };

                  l({ statsObject });

                  eligibleMap.set(channel.channelId, statsObject);
               }

               return await this.create({
                  _id: new Types.ObjectId(),
                  guildId: guildId,
                  discordId: voterId,
                  eligibleChannels: eligibleMap,
               });
            } catch (error) {
               l('IS THIS THE ERROR?');
               l({ error });
            }
         },
         async checkVotingRoles(memberRoles) {
            const hasVotingRoles = await PollChannel.countDocuments({
               allowedRoles: { $in: [...memberRoles.keys()] },
            }).exec();

            return !!hasVotingRoles;
         },
         async findEligibleChannels(memberRoles) {
            l('[...memberRoles.keys()]', [...memberRoles.keys()]);
            const eligibleChannels = await PollChannel.find({
               allowedRoles: { $in: [...memberRoles.keys()] },
            });

            if (!eligibleChannels)
               throw new Error('User is not eligible to vote in any channels.');

            return eligibleChannels;
         },
         async logAttr() {
            l(this.schema.statics);
            l(this.schema.methods);
            l(this.schema.query);
         },
         async userExists(guildId, discordId) {
            l('MODEL => User : STATIC => userExists:');

            l({ guildId });
            l({ discordId });
            // const userDoc = await this.findOne()
            //    .byDiscordId(guildId, discordId)
            //    .exec();
            const userDoc = await model('User')
               .findOne()
               .byDiscordId(discordId, guildId)
               .exec();

            l({ userDoc });

            return userDoc;
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
               channelId
            )
               ? eligibleChannels.get(channelId)
               : null;
            // console.log(this);
            // console.log({ channelId });
            // console.log({ eligibleChannels });
            // console.log(eligibleChannels[channelId]);
            // console.log(
            //    eligibleChannels[channelId].participatedPolls /
            //       eligibleChannels[channelId].eligibleChannels
            // );

            // console.log({ eligiblePolls, participatedPolls });

            console.log(
               Math.round((participatedPolls / eligiblePolls) * 100).toFixed(2)
            );

            if (eligiblePolls === 0)
               return 'User has not yet been a party to an eligible poll';
            if (participatedPolls === 0) return '0%';

            // console.log(
            //    'FROM USER PARTICIPATION METHOD\n',
            //    typeof `${Math.round(
            //       (participatedPolls / eligiblePolls) * 100
            //    ).toFixed(2)}%`
            // );

            return `${Math.round(
               (participatedPolls / eligiblePolls) * 100
            ).toFixed(2)}%`;
         },
         async incParticipation(channelId, configId) {
            gr('DOCUMENT => User : METHOD => incParticipation:');

            l(
               '!this.eligibleChannels.has(channelId) => ',
               !this.eligibleChannels.has(channelId)
            );

            try {
               if (!this.eligibleChannels.has(channelId)) {
                  l(
                     `Channel key ${channelId} does NOT exist!\n Creating new participationObject for this channel...`
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
                           allowedUsers[this.discordId] === true
                     ).length,
                  };

                  l(`New participation object => `, { participationObject });

                  await this.updateOne(
                     {
                        $set: {
                           [`eligibleChannels.${channelId}`]:
                              participationObject,
                        },
                     },
                     { new: true }
                  ).exec();
               } else {
                  l(`Channel key ${channelId} exists!`);

                  const newParticipation = this.eligibleChannels.get(channelId);

                  l(
                     'channelParticiation before incrementation : ',
                     newParticipation
                  );

                  newParticipation.participatedPolls++;

                  // this.markModified('eligibleChannels');
                  await this.updateOne(
                     {
                        $set: {
                           [`eligibleChannels.${channelId}`]: newParticipation,
                        },
                     },
                     { new: true }
                  ).exec();

                  l(
                     'channelParticiation after incrementation : ',
                     this.eligibleChannels.get(channelId)
                  );
               }
            } catch (error) {
               l(':::ERROR IN PARTICIPATION INCREMENTATION:::');
               lerr(error);
            }
            grE('DOCUMENT => User : METHOD => incParticipation:');
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
               console.trace({ error });
               throw new Error(
                  `Unable to fulfill member lookup:\n INFO:\n${error.message}`
               );
            }
         },
      },
   }
);

// userSchema.virtual('getVotes', {
//    ref: 'Vote',
//    localField: '_id',
//    foreignField: 'userNested',
// });

//Export the model
module.exports = model('User', userSchema);
