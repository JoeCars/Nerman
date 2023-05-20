const { model, Schema } = require('mongoose');
const Logger = require('../../helpers/logger');

const GuildConfigSchema = new Schema(
   {
      _id: Schema.Types.ObjectId,
      guildId: {
         type: String,
         required: true,
         unique: true,
      },
   },
   {
      statics: {
         async findGuildConfig(guildId) {
            Logger.info(
               'db/schemas/GuildConfig.js: Attempting to find guild config.',
               {
                  guildId: guildId,
               }
            );

            const guildConfig = await this.findOne({ guildId: guildId })
               .populate('pollChannels')
               .exec();

            Logger.info('db/schemas/GuildConfig.js: Retrieved guild config.', {
               guildId: guildId,
            });

            return guildConfig;
         },
      },
   }
);

GuildConfigSchema.virtual('pollChannels', {
   ref: 'channelConfig',
   localField: '_id',
   foreignField: 'guildConfig',
});

module.exports = model('GuildConfig', GuildConfigSchema);
