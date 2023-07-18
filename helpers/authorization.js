const { GuildMember, Permissions } = require('discord.js');
const Admin = require('../db/schemas/Admin');
const Logger = require('./logger');

/**
 *
 * @param {number} authorizationLevel
 * @param {GuildMember} user
 * @returns {boolean}
 */
exports.isUserAuthorized = async function (authorizationLevel, user) {
   switch (authorizationLevel) {
      case 1:
         return true;
      case 2:
         return (
            exports.isUserANermanDeveloper(user.id) ||
            exports.isUserADiscordAdmin(user) ||
            exports.isUserANermanAdmin(user)
         );
      case 3:
         return (
            exports.isUserANermanDeveloper(user.id) ||
            exports.isUserADiscordAdmin(user)
         );
      case 4:
         return exports.isUserANermanDeveloper(user.id);
      default:
         throw new Error(
            "Please enter a number between 1 to 4 when checking the user's authorization.",
         );
   }
};

/**
 * @param {GuildMember} user
 */
exports.isUserADiscordAdmin = function (user) {
   return user.permissions.has(Permissions.FLAGS.MANAGE_GUILD);
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

   return count !== 0;
};

/**
 * @param {string} userId
 */
exports.isUserANermanDeveloper = function (userId) {
   // FIXME: will need to remove these after we figure out a better permission control for admin command
   const authorizedIds = process.env.BAD_BITCHES.split(',');
   return authorizedIds.includes(userId);
};
