const handleCommand = async interaction => {
   const command = interaction.client.commands.get(interaction.commandName);
   console.log('This is the command handler');


   if (!command) return;

   try {
      await command.execute(interaction);
   } catch (error) {
      console.error(error);

      return interaction.reply({
         content:
            error.message || 'There was an error while executing this command!',
         ephemeral: true,
      });
   }
};

const handleButton = async interaction => {
   // console.log(interaction);
   console.log('This is the button handler');
   // const collector = interaction.message.createMessageComponentCollector({
   //    time: 15000,
   // });

   // console.log(collector);

   // let stuff;

   // collector.on('collect', async i => {
      // console.log(
      //    `Collector.on collect: \nInteraction: ${i}\nInteraction.type: ${i.type}\nCollector: ${collector}\n`
      // );
      // console.log(
      //    `Collector.on collect: \nInteraction: ${i}\nInteraction.type: ${i.type}\nInteraction.message: ${i.message}\nInteraction.values(): ${i.values}\nInteraction.()): ${i.entries}\nInteraction.size: ${i.size}\nCollector: ${collector}\n`
      // );
      // console.log(collector.collected.map(x => x));
      // collector.collected.each(x => console.log(x.size));

      // console.log(
      //    `collector.collected.each(x => cl(x))\n ${collector.collected}`
      // );

      // await i.update({ content: 'Anotha boop' });
   // });
};

module.exports.handleCommand = interaction => handleCommand(interaction);
module.exports.handleButton = interaction => handleButton(interaction);
