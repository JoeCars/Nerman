const { logToObject } = require('../utils/functions');
const { drawBar } = require('../helpers/poll');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

// Block arrays to denote blocks of progress beginning at 0 and increasing in steps of 0.125
// const uniYBlockArray = ['', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
// const uniXBlockArray = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];
// const barStart = '▏';
// const barEnd = '▕';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('test-poll-scratch')
      .setDescription(
         'testing out the presence of buttons for voting functionality.'
      )
      .addIntegerOption(option =>
         option
            .setName('amount')
            .setDescription('Set the number of options/buttons (max 25)')
            .setRequired(false)
      )
      .addIntegerOption(option =>
         option
            .setName('duration')
            .setDescription('Choose time in minutes')
            .setRequired(false)
      ),

   async execute(interaction) {
      let btnAmount = interaction.options.getInteger('amount') ?? 2;
      const duration = interaction.options.getInteger('duration') ?? 5000;
      let rows = [];
      const {
         member: { nickname, user },
      } = interaction;

      // let results = ['```','```'];
      let resultsArr = ['```', '```'];
      let resultsOutput = [];

      const barWidth = 8;
      let totalVotes = 0;

      let options = new Map([
         ['maxLength', barWidth],
         ['totalVotes', totalVotes],
      ]);

      if (Math.sign(btnAmount) !== 1 || btnAmount > 25) return;

      const rowCount = Math.ceil(btnAmount / 5);

      for (let i = 0; i < rowCount; i++) {
         const row = new MessageActionRow();
         for (j = 0; j < btnAmount && j < 5; j++) {
            const label = `Option ${i * 5 + j + 1} `;
            const customId = `row-${i + 1}-button-${j + 1}`;

            row.addComponents(
               new MessageButton()
                  .setCustomId(customId)
                  .setLabel(label)
                  .setStyle('PRIMARY')
            );

            let optionObj = {
               label,
               votes: 0,
               get portion() {
                  return options.get('totalVotes') !== 0
                     ? this.votes / options.get('totalVotes')
                     : 0;
               },
               get portionOutput() {
                  return ` ${(this.portion * 100).toFixed(1)}%`;
               },
               get bar() {
                  return drawBar(options.get('maxLength'), this.portion);
               },
               get completeBar() {
                  return [this.label, this.bar, this.portionOutput].join('');
               },
            };

            // results.splice(
            //    -1,
            //    0,
            //    `Option ${
            //       i * 5 + (j + 1)
            //    } ${barStart}\u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b \u200b${barEnd} 0%`
            // );

            options.set(customId, optionObj);

            resultsArr.splice(-1, 0, optionObj.completeBar);
         }

         btnAmount -= 5;
         rows.push(row);
      }

      // rows.forEach(row => console.table(row.components));

      resultsOutput = resultsArr.join('\n');

      const histogramEmbed = new MessageEmbed()
         .setColor('#0099ff')
         .setTitle('Poll')
         .setAuthor(
            nickname ?? user.username,
            user.avatarURL(),
            'https://nerman.wtf/'
         )
         .setThumbnail('https://i.imgur.com/AfFp7pu.png')
         .setDescription('Test Description of the polling command.')
         .addField('\u200B', '\u200B')
         .addField('Voting Histogram:', resultsOutput)
         .setTimestamp();

      // console.log(histogramEmbed);

      let interactionMessage = await interaction.reply({
         content: 'This is a test poll',
         components: rows,
         embeds: [histogramEmbed],
         ephemeral: true,
         fetchReply: true,
      });

      const collector =
         await interactionMessage.createMessageComponentCollector({
            time: duration || 15000,
         });

      let buttonInteraction = null; // storing interaction outside

      collector.on('collect', async i => {
         // logToObject(collector); // helper to see parse and log collector
         // console.log(i);
         let size = collector.collected.size;
         options.set('totalVotes', size);

         options.get(i.customId).votes++;

         resultsArr = ['```', '```'];
         options.forEach((value, key) => {
            if (key !== 'maxLength' && key !== 'totalVotes') {
               resultsArr.splice(-1, 0, value.completeBar);
            }
         });

         resultsOutput = resultsArr.join('\n');

         let newFields = [
            { name: '\u200B', value: '\u200B' },
            {
               name: 'New Histogram',
               value: resultsOutput,
            },
         ];

         histogramEmbed.setFields(newFields);

         i.update({
            content: `interaction Updated ${size}`,
            embeds: [histogramEmbed],
            fetchReply: true,
         });

         buttonInteraction = i;

         console.log(histogramEmbed.fields);
      });

      collector.on('end', async (collected, reason) => {
         console.log(`Collected ${collected.size} items`);
         console.log(reason);

         try {
            await buttonInteraction.editReply(
               'Testing poll end message update! Will output histogram eventually and remove button components'
            );
         } catch (error) {
            console.error(error);
            // console.info(error);
         }
      });
   },
};
