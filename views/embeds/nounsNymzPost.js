const { MessageEmbed } = require('discord.js');
const { hyperlink, bold } = require('@discordjs/builders');

const shortenAddress = require('../../helpers/nouns/shortenAddress');

exports.getPostUrl = function (postId) {
   return `https://nouns.nymz.xyz/posts/${postId}`;
};

exports.getUserUrl = function (userId) {
   return `https://nouns.nymz.xyz/users/${userId}`;
};

exports.getTitleHyperlink = function (post) {
   const titleUrl = exports.getPostUrl(post.id);
   const titleText = post.title;
   return hyperlink(titleText, titleUrl);
};

exports.extractAnonymousUsernameFromId = function (userId) {
   let lastDashIndex = userId.lastIndexOf('-');
   if (lastDashIndex === -1) {
      lastDashIndex = userId.length;
   }
   return userId.substring(0, lastDashIndex);
};

exports.findUsername = async function (post, Nouns) {
   if (!post.doxed) {
      return exports.extractAnonymousUsernameFromId(post.userId);
   }
   const username =
      (await Nouns.ensReverseLookup(post.userId)) ??
      (await shortenAddress(post.userId));
   return username;
};

exports.getUsernameHyperlink = async function (post, Nouns) {
   const usernameUrl = exports.getUserUrl(post.userId);
   const username = await exports.findUsername(post, Nouns);
   return hyperlink(username, usernameUrl);
};

exports.generatePostBody = function (post, username) {
   return `${post.body}\n\n${bold('Username')}\n${username}`;
};

exports.generateNewPostEmbed = async function (post, Nouns) {
   const title = exports.getTitleHyperlink(post);
   const username = await exports.getUsernameHyperlink(post, Nouns);
   const body = exports.generatePostBody(post, username);
   return new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(body);
};
