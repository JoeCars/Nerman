const { Schema, model } = require('mongoose');

const HouseFilterConfigSchema = new Schema(
   {
      _id: Schema.Types.ObjectId,
      guildId: {
         type: String,
         required: true,
      },
      channelId: {
         type: String,
         required: true,
      },
      permittedHouses: [
         {
            type: [String],
            required: true,
         },
      ],
      isDeleted: {
         type: Boolean,
         required: false,
         default: false,
      },
   },
   {
      methods: {
         async softDelete() {
            this.isDeleted = true;
            return this.save();
         },
      },
   },
);

module.exports = model('HouseFilterConfig', HouseFilterConfigSchema);
