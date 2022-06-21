// Package Dependencies
require('dotenv').config();
const mongoose = require('mongoose');
// Personal Imports
const { encodeURI } = require('../utils/functions');
const User = require('./schemas/UserSchema');

const usernameSegment = encodeURI(process.env.MONGODB_DEV_USER);
const passwordSegment = encodeURI(process.env.MONGODB_DEV_PASSWORD);

const mongoURI =
   process.env.DB_ENV === 'Cloud'
      ? `mongodb+srv://${usernameSegment}:${passwordSegment}@clusterman.cx1ad.mongodb.net/test`
      : 'mongodb://localhost/polls-test';

try {
   mongoose.connect(mongoURI);
   console.log('Connected to DB');
} catch (error) {
   console.error(error);
}

const newUser = User.create({
   username: 'Test User Creation',
   discordId: '47yhlkjgfdnsfk',
});
