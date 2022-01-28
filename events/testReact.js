const nTwitter = require(`../helpers/twitter.js`);
const nMongoDB = require(`../helpers/mongodb.js`);
const nThreshold = require(`../helpers/nThreshold.js`);

const {
	MessageMentions: { USERS_PATTERN },
} = require('discord.js');

module.exports = {
	name: 'messageReactionAdd',
	async execute(reaction, user) {
		// const matches = reaction.message.mentions.match(USERS_PATTERN);

		// /^<@!?(\d+)>$/

		// console.log('<---------------- REACTION -------------------> \n', matches);
		// console.log('<---------------- REACTION -------------------> \n', reaction);
		// console.log(
		// 	'<---------------- REACTION.GUILD -------------------> \n',
		// 	reaction.message.guild
		// );

		// console.log(
		// 	'<---------------- REACTION.MESSAGE.MENTIONS -------------------> \n',
		// 	reaction.message.mentions
		// );

		// console.log(
		// 	'<---------------- REACTION.MESSAGE.MENTIONS.MEMBERS -------------------> \n',
		// 	reaction.message.mentions.members
		// );

		// console.log(
		// 	'<---------------- REACTION.EMOJI -------------------> \n',
		// 	reaction.emoji
		// );

		// console.log(
		// 	'<---------------- REACTION.EMOJI.NAME -------------------> \n',
		// 	reaction.emoji.name
		// );

		// if (reaction.emoji.name == 'mag') {
		// 	let mentions = reaction.message.mentions;
		// 	console.log(mentions);
		// }
	},
};
