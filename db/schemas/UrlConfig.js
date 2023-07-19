const { Schema, model } = require('mongoose');
const Logger = require('../../helpers/logger');

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
            let config = null;
            try {
               config = await this.findOne({ guildId: guildId }).exec();
            } catch (error) {
               Logger.error(
                  'db/schemas/UrlConfig.js: Unable to fetch the config due to a database error.',
                  {
                     error: error,
                     guildId: guildId,
                  },
               );
               config = null;
            }

            return {
               propUrl: config ? config.propUrl : DEFAULT_PROPOSAL_URL,
               nounUrl: config ? config.nounUrl : DEFAULT_NOUNS_URL,
            };
         },
      },
   },
);

module.exports = model('UrlConfig', UrlConfigSchema);
