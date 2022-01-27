const nTwitter = require(`../helpers/twitter.js`);
const nMongoDB = require(`../helpers/mongodb.js`);
const nThreshold = require(`../helpers/nThreshold.js`);

module.exports = {
	name: 'messageReactionAdd',
	async execute(reaction, user) {
		//reaction.message.guild.roles.cache.forEach(role => console.log(role.name, role.id)) //prints all rolls
		//"@everyone" is default role

		// below code to calculate voteThreshold should be refactored with threshold.js code into nThreshold.js
		const Role = reaction.message.guild.roles.cache.find(
			role => role.name == 'Voters'
		);

		let votersOnline = reaction.message.guild.members.cache
			.filter(member => member.presence?.status == 'online')
			.filter(member => member.roles.cache.find(role => role == Role)).size;

		let voteThreshold = nThreshold.getThreshold(votersOnline);

		let msgAttachmentUrls = [];

		let {
			content,
			author: { username },
		} = reaction.message;

		let mappedMentions = {};
		let mentions = reaction.message.mentions.members;

		mentions.forEach(mention => {
			mappedMentions[mention.user.id] = mention.nickname
				? mention.nickname
				: mention.user.username;
		});

		let tweetContent = await nTwitter.formatTweet(
			content,
			username,
			mappedMentions
		);
		
		let messageTweeted = await reaction.message.reactions.cache.get(
			'931919315010220112'
		); //check for NermanBlast

		if (reaction.message.attachments.size > 0) {
			for (const attachment of reaction.message.attachments) {
				msgAttachmentUrls.push(attachment[1].url);
			}
		}

		if (
			!messageTweeted &&
			reaction.emoji.name == 'Nerman' &&
			reaction.count > voteThreshold - 1
		) {
			nTwitter.post(tweetContent, msgAttachmentUrls);

			// mark message with NermanBlast emoji
			await reaction.message.react('932664888642400276');
		}
	},
};
