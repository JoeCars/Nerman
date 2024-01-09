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
            address: {
               type: String,
               required: true,
            },
            name: {
               type: String,
               required: true,
            },
            url: {
               type: String,
               required: true,
            },
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
         includes(address) {
            return this.permittedHouses
               .map(house => house.address)
               .includes(address);
         },
      },
   },
);

module.exports = model('HouseFilterConfig', HouseFilterConfigSchema);
