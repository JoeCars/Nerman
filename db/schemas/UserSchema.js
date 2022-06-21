const { Schema, SchemaTypes, model } = require('mongoose');

const UserSchema = new Schema({
   username: SchemaTypes.String,
   discordId: { type: SchemaTypes.String, required: true },
});

module.exports = model('user', UserSchema);
