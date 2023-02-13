const { model, Schema, Types } = require('mongoose');
const PollChannel = require('./PollChannel');
const Poll = require('./Poll');
const { log: l } = console;

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
         // unique: true,
         validate: {
            validator: async function (discordId) {
               const userExists = await this.schema.statics.userExists(
                  this.guildId,
                  discordId
               );

               l({ userExists });

               return !userExists;
            },
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
            l('FROM STATIC');

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
         async incParticipation(channelId) {
            const newParticipation = this.eligibleChannels.get(channelId);

            newParticipation.participatedPolls++;

            // mark modified because Mixed SchemaType loses Mongoose's ability to detect changes to the data
            this.markModified('eligibleChannels');
            await this.save();
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
