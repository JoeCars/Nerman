const { model, Schema, SchemaTypes } = require('mongoose');

const PollSchema = new Schema({
   GuildID: String,
   MessageID: String,
   Details: Array,
});

module.exports = model('poll', PollSchema);
