const {
   GuildMember,
   BaseInteraction,
   PermissionsBitField,
} = require('discord.js');
const Admin = require('../db/schemas/Admin');
const Logger = require('./logger');

/**
 * @param {BaseInteraction} interaction
 * @param {number} permissionLevel
 */
exports.authorizeInteraction = async function (interaction, permissionLevel) {
   const guildUser = await interaction.guild.members.fetch(interaction.user.id);
   if (!(await exports.isUserAuthorized(permissionLevel, guildUser))) {
      throw new Error('You do not have permission to use this command.');
   }
};

/**
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
   return user.permissions.has(PermissionsBitField.Flags.ManageGuild);
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
   const authorizedIds = process.env.DEVELOPER_IDS.split(',');
   return authorizedIds.includes(userId);
};
