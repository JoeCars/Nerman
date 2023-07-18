const { Schema, model } = require('mongoose');

const DEFAULT_PROPOSAL_URL = 'https://nouns.wtf/vote/';
const DEFAULT_NOUNS_URL = 'https://nouns.wtf/noun/';

const UrlConfigSchema = new Schema(
   {
      _id: Schema.Types.ObjectId,
      guildId: {
         type: String,
         required: true,
      },
      propUrl: {
         type: String,
         required: true,
         default: DEFAULT_PROPOSAL_URL,
      },
      nounUrl: {
         type: String,
         required: true,
         default: DEFAULT_NOUNS_URL,
      },
   },
   {
      statics: {
         /**
          * @param {string} guildId
          */
         async fetchUrls(guildId) {
            const config = await this.findOne({ guildId: guildId }).exec();

            return {
               propUrl: config ? config.propUrl : DEFAULT_PROPOSAL_URL,
               nounUrl: config ? config.nounUrl : DEFAULT_NOUNS_URL,
            };
         },
      },
   },
);

module.exports = model('UrlConfig', UrlConfigSchema);
