const nThreshold = require(`../../../helpers/nThreshold.js`);

module.exports = {
	subCommand: 'nerman.threshold',
	async execute(interaction) {
		let votingRole = 'Voters';

		const Role = interaction.guild.roles.cache.find(
			role => role.name == votingRole
		);
		let votersOnline = interaction.guild.members.cache
			.filter(member => member.presence?.status == 'online')
			.filter(member => member.roles.cache.find(role => role == Role)).size;
		let voteThreshold = nThreshold.getThreshold(votersOnline);

		await interaction.reply(
			votersOnline +
				' voters online. Message will be tweeted at ' +
				voteThreshold +
				' Nerman emoji(s).'
		);
	},
};
