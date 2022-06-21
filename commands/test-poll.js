const { logToObject } = require('../utils/functions');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('test-poll')
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

      if (Math.sign(btnAmount) !== 1 || btnAmount > 25) return;

      const rowCount = Math.ceil(btnAmount / 5);

      for (i = 0; i < rowCount; i++) {
         const row = new MessageActionRow();

         for (j = 0; j < btnAmount && j < 5; j++) {
            row.addComponents(
               new MessageButton()
                  .setCustomId(`row-${i + 1}-button-${j + 1}`)
                  .setLabel(`Option ${i * 5 + (j + 1)}`)
                  .setStyle('PRIMARY')
            );
         }

         btnAmount -= 5;
         rows.push(row);
      }

      // console.log(
      //    `Interaction: ${interaction}\n Interaction.type: ${interaction.type}\n Interaction.message: ${interaction.message}\n interaction.collector: ${interaction.collector}\n`
      // );

      // console.log(interaction.message);

      // const collector = interaction.message.createMessageComponentCollector({
      //    time: 15000,
      // });

      // console.log(collector);

      // collector.on('collect', async i => {
      //    console.log(
      //       `Collector.on collect: \nInteraction: ${i}\nInteraction.type: ${i.type}\nCollector: ${collector}\nCollected: ${collected}\n Collected.size: ${collected.size}`
      //    );
      // });

      // await interaction.reply({
      //    content: 'This is a test poll',
      //    components: rows,
      //    ephemeral: true,
      // });
      console.log(
         '/---------------------------------------------------------------------------------/\n/-----------------------------------RUNNIT-----------------------------------/\n/---------------------------------------------------------------------------------/\n'
      );
      let interactionMessage = await interaction.reply({
         // const interactionMessage = await interaction.deferReply({
         content: 'This is a test poll',
         components: rows,
         ephemeral: true,
         fetchReply: true,
      });

      // console.log('interactionMessage');
      // console.log(interactionMessage);
      // console.log(interactionMessage.content);
      // console.log(`Interaction post-reply: ${interaction}`);

      // const filter = i => {
      //    i.deferUpdate();
      //    return true;
      // };

      const collector =
         await interactionMessage.createMessageComponentCollector({
            time: duration || 15000,
         });

      // let iter = 0;

      collector.on('collect', async i => {
         // console.log(
         //    `Collector.on collect: \nInteraction: Type: ${typeof i}\n${await logToObject(
         //       i
         //    )}\nInteraction.type: ${
         //       i.type
         //    }\nCollector: Type: ${typeof collector}\n${await logToObject(
         //       collector
         //    )}`
         // );

         // logToObject(i);
         logToObject(collector);
         let size = collector.collected.size;

         i.update({ content: `interaction Updated ${size}`, fetchReply: true });
         // i.editReply({ content: `interaction Updated ${size}` });

         // iter++;
      });

      collector.on('end', async (collected, reason) => {
         console.log(`Collected ${collected.size} items`);
         // console.log(collected.first());

         // console.log(interactionMessage);
         console.log(reason);
         // console.log(interaction);
         console.log(interactionMessage);
         // let test = await interaction.fetchReply();
         // let test = await interaction
         //    .fetchReply()
         //    .then(async reply => await reply.fetch(reply.id))
         //    .catch(err => console.error(err));

         // console.log(await test);
         // console.log(await test.id);
         // console.log(await test.editable);

         let msg = await interaction.channel.messages.fetch(
            interactionMessage.id
         );

         console.log(await msg);

         try {
            await msg.reply('New content');
         } catch (error) {
            console.error(error);
         }

         // try {
         //    await test.edit({ content: 'Butts' });
         // } catch (error) {
         //    console.error(error);
         // }
         // await test
         //    .edit({ content: 'Butts' })
         //    .then(msg =>
         //       console.log(`Updated the content of a message to ${msg.content}`)
         //    )
         //    .catch(console.error);
         // await test.edit({ content: 'Butts' });

         // await test
         //    .edit('This is my new content!')
         // .then(msg =>
         //    console.log(`Updated the content of a message to ${msg.content}`)
         // )
         // .catch(console.error);
         // console.log(i);

         // logToObject(collector);

         // console.log('fetchReply');
         // console.log(interactionMessage.fetchReply());

         // interactionMessage
         //    .edit({ content: 'This is my new content!' })
         //    .then(msg =>
         //       console.log(`Updated the content of a message to ${msg.content}`)
         //    )
         //    .catch(console.error);

         // interactionMessage
         //    .edit('This is my new content!')
         //    .then(msg =>
         //       console.log(`Updated the content of a message to ${msg.content}`)
         //    )
         //    .catch(console.error);

         // console.log(interactionMessage.content);
         // interactionMessage.update({ content: 'Poll ended!' });
      });
   },
};
