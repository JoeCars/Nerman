const { GuildMember, Permissions } = require('discord.js');
const Admin = require('../db/schemas/Admin');
const Logger = require('./logger');

/**
 * @param {GuildMember} user
 */
exports.isUserADiscordAdmin = function (user) {
   return user.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
};

/**
 * @param {GuildMember} user
 */
exports.isUserANermanAdmin = async function (user) {
   let count = 0;

   try {
      count = await Admin.countDocuments({
         guildId: user.guild.id,
         userId: user.id,
      }).exec();
   } catch (error) {
      Logger.error('helpers/authorization.js: Unable to search for admins.', {
         error: error,
      });
   }

   return count;
};

/**
 * @param {string} userId
 */
exports.isUserANermanDeveloper = function (userId) {
   // FIXME: will need to remove these after we figure out a better permission control for admin command
   const authorizedIds = process.env.BAD_BITCHES.split(',');
   return authorizedIds.includes(userId);
};
