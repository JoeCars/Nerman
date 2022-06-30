const { SlashCommandBuilder } = require('@discordjs/builders');
const {
   CommandInteraction,
   MessageEmbed,
   MessageActionRow,
   MessageButton,
} = require('discord.js');
const DB = require('../db/schemas/PollSchema');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('ez-poll')
      .setDescription('testing an easy poll command')
      .addStringOption(option =>
         option
            .setName('poll-type')
            .setDescription('Nouncil / Nouner')
            .addChoice('Nouncil', 'nouncil')
            .addChoice('Nouns', 'nouns')
            .setRequired(true)
      )
      .addStringOption(option =>
         option
            .setName('poll-title')
            .setDescription('Title this poll')
            .setRequired(true)
      )
      .addStringOption(option =>
         option
            .setName('poll-description')
            .setDescription('Describe the topic of this poll')
            .setRequired(true)
      )
      .addStringOption(option =>
         option
            .setName('poll-options')
            .setDescription('Comma separated values for chocies')
            .setRequired(true)
      ),
   async execute(interaction) {
      const { options, guildId, member, user } = interaction;

      const pType = options.getString('poll-type');
      const pTitle = options.getString('poll-title');
      const pDescription = options.getString('poll-description');
      const pOptions = options.getString('poll-options').trim().split(',');

      console.log({ pOptions });

      const buttons = new MessageActionRow();

      pOptions.forEach(option => {
         buttons.addComponents(
            new MessageButton()
               .setCustomId(option.toLowerCase())
               .setLabel(option)
               .setStyle('PRIMARY')
         );
      });

      const embed = new MessageEmbed()
         .setColor('NAVY')
         .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
         .addFields(
            { name: 'Title', value: pTitle },
            { name: 'Description', value: pDescription },
            { name: 'Status:', value: 'Pending' }
         )
         .setTimestamp();

      try {
         const message = await interaction.reply({
            content: 'Testing this poll now too',
            components: [buttons],
            embeds: [embed],
            ephemeral: true,
            fetchReply: true,
         });

         DB.create({
            GuildID: guildId,
            MessageID: message.id,
            Details: [
               {
                  MemberID: member.id,
                  Type: pType,
                  Title: pTitle,
                  Suggestion: pDescription,
               },
            ],
         });
      } catch (error) {
         console.error(error);
      }
   },
};
