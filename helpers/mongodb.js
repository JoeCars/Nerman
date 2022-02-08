const { MongoClient } = require('mongodb');
const dbUri = process.env.MONGODB_URI;

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
      console.log(err);
   } finally {
      await client.close();
      return hasMessageBeenTweeted;
   }
};

var markMessageAsTweeted = async function (message_id, user_id) {
   console.log('message_id' + message_id + ', user_id' + user_id);

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
      console.log(err);
   } finally {
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
