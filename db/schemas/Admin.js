const { Schema, model } = require('mongoose');

const AdminSchema = new Schema({
   _id: Schema.Types.ObjectId,
   guildId: {
      type: String,
      required: true,
   },
   userId: {
      type: String,
      required: true,
   },
});

module.exports = model('AdminSchema', AdminSchema);
