const { Schema, model } = require('mongoose');

const UrlConfigSchema = new Schema({
   _id: Schema.Types.ObjectId,
   guildId: {
      type: String,
      required: true,
   },
   propUrl: {
      type: String,
      required: true,
      default: 'https://nouns.wtf/vote/',
   },
   nounUrl: {
      type: String,
      required: true,
      default: 'https://nouns.wtf/noun/',
   },
});

module.exports = model('UrlConfig', UrlConfigSchema);
