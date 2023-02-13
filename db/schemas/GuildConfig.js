const { model, Schema } = require('mongoose');
const { log: l } = console;

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
            const guildConfig = await this.findOne({ guildId: guildId })
               .populate('pollChannels')
               .exec();

            l('guildConfig', guildConfig);

            return guildConfig
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
