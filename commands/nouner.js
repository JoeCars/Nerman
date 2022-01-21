const { SlashCommandBuilder } = require('@discordjs/builders');
const nounpic = require(`../helpers/nounpic.js`);

// typing console.log is exhausting
const cl = string => console.log(string);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nouner')
		.setDescription(
			'Retrieve a tile of Nouns owned by a nouner.  Command Structure: /nouner <ETH Address || ENS Name>'
		)
		.addStringOption(option =>
			option
				.setName('target')
				.setDescription('Enter a ENS name or wallet address')
				.setRequired(true)
		)
		.addBooleanOption(option =>
			option
				.setName('delegates')
				.setDescription(
					'Include Nouns delegated to this address? (This is false if left blank)'
				)
		),

	async execute(interaction) {
		const queryTarget = interaction.options.getString('target');
		cl('BOOLEAN??', interaction.options.getBoolean('delegates'));
		const includeDelegates =
			interaction.options.getBoolean('delegates') ?? false;
		const msgAttach = await nounpic.fetchNouner(queryTarget, includeDelegates);

		await interaction.reply({
			content: `Retrieving tile of nouns belonging to ${queryTarget}`,
			files: [msgAttach],
			ephemeral: true,
		});
	},
};
