const { SlashCommandBuilder } = require('@discordjs/builders');
const { Message, MessageAttachment, MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('noun')
		.setDescription('Get the SVG of specified Noun:  /noun 3')
		.addIntegerOption(option =>
			option.setName('int').setDescription('Enter an integer')
		),
	async execute(interaction) {
		const nounNum = interaction.options.getInteger('int');

		const msgAttach = new MessageAttachment(); // will instantiate this here, to add a 500 error code noun image later if there is a bad response

		//Opensea Link, Owner, previous auction info. Integrate Open Sea API

		try {
			const resp = await fetch(`https://noun.pics/${nounNum}.png`);

			if (resp.status !== 200) {
				await interaction.reply({
					content: 'Unable to return Noun, are you sure this Noun exists yet?',
					files: null,
					ephemeral: true,
				});
				throw new Error(
					'Unable to return Noun, are you sure this Noun exists yet?'
				);
			}

			msgAttach.attachment = `https://noun.pics/${nounNum}.png`;

			await interaction.reply({
				content: `Noun ${nounNum}`,
				files: [msgAttach],
				ephemeral: true,
			});
		} catch (error) {
			console.log(error);
		}

	},
};
