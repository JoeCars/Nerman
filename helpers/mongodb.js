const { MongoClient } = require('mongodb');
const dbUri = process.env.MONGODB_URI;

const Logger = require('./logger');

module.exports.init = async function () {
   return await init();
};

module.exports.hasMessageBeenTweeted = async function (id) {
   return await hasMessageBeenTweeted(id);
};

module.exports.markMessageAsTweeted = async function (message_id, user_id) {
   await markMessageAsTweeted(message_id, user_id);
};

var init = async function () {};

var hasMessageBeenTweeted = async function (id) {
   Logger.info(
      'helpers/mongodb.js/hasMessageBeenTweeted(): Checking if message has been tweeted.',
      {
         id: id,
      }
   );

   const client = new MongoClient(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
   });
   let hasMessageBeenTweeted = false;

   try {
      await client.connect();
      const message = await client
         .db('discord')
         .collection('posts')
         .findOne({ message_id: id });

      if (message) {
         hasMessageBeenTweeted = true;
      }
   } catch (err) {
      Logger.error(
         'helpers/mongodb.js/hasMessageBeenTweeted(): Received an error.',
         {
            error: err,
         }
      );
   } finally {
      Logger.info(
         'helpers/mongodb.js/hasMessageBeenTweeted(): Finished checking if message has been tweeted..',
         {
            id: id,
         }
      );

      await client.close();
      return hasMessageBeenTweeted;
   }
};

var markMessageAsTweeted = async function (message_id, user_id) {
   Logger.info(
      'helpers/mongodb.js/markMessageAsTweeted(): Marking message as tweeted.',
      {
         messageId: message_id,
         userId: user_id,
      }
   );

   const client = new MongoClient(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
   });

   try {
      await client.connect();
      const database = client.db('discord');
      const collection = database.collection('posts');
      const message = await collection.findOne({ message_id: message_id });

      if (!message) {
         await collection.insertOne({
            user_id: user_id,
            message_id: message_id,
            date_tweeted: Date.now(),
         });
      }
   } catch (err) {
      Logger.err(
         'helpers/mongodb.js/markMessageAsTweeted(): Received an error.',
         {
            error: err,
         }
      );
   } finally {
      Logger.info(
         'helpers/mongodb.js/markMessageAsTweeted(): Finished marking message as tweeted.',
         {
            messageId: message_id,
            userId: user_id,
         }
      );
      await client.close();
   }
};

//TODO
// Set up a "create-database.js" js file that can be run to set up empty MongoDB cluster

// DISCORD POSTS DB
// {
//     "_id": -1, //discord message id
//     "user_id": -1,  //discord user id
//     "date_tweeted":Timestamp, // date tweeted

// }
