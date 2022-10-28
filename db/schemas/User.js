const { model, Schema } = require('mongoose');

// Declare the Schema of the Mongo model
const userSchema = new Schema(
   {
      _id: Schema.Types.ObjectId,
      discordId: {
         type: String,
         required: true,
         unique: true,
      },
      eligibleChannels: {
         type: Map,
         of: Schema.Types.Mixed,
         default: new Map(),
      },
   },
   {
      statics: {},
      methods: {
         async participation(channelId) {
            const { eligibleChannels } = this;
            const eligibleHere = eligibleChannels.has(channelId);

            if (!eligibleHere)
               return 'User is not eligible to vote in this channel.';

            const { eligiblePolls, participatedPolls } = eligibleChannels.get(
               channelId
            )
               ? eligibleChannels.get(channelId)
               : null;
            // console.log(this);
            console.log({ channelId });
            console.log({ eligibleChannels });
            // console.log(eligibleChannels[channelId]);
            // console.log(
            //    eligibleChannels[channelId].participatedPolls /
            //       eligibleChannels[channelId].eligibleChannels
            // );

            console.log({ eligiblePolls, participatedPolls });

            console.log(
               Math.round((participatedPolls / eligiblePolls) * 100).toFixed(2)
            );

            if (eligiblePolls === 0)
               return 'User has not yet been a party to an eligible poll';
            if (participatedPolls === 0) return '0%';

            return `${Math.round(
               (participatedPolls / eligiblePolls) * 100
            ).toFixed(2)}%`;
         },
      },
      query: {
         byDiscordId(discordId) {
            try {
               return this.where({ discordId: new RegExp(discordId, 'i') });
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
