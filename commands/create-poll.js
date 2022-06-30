const { SlashCommandBuilder } = require('@discordjs/builders');
const {
   Modal,
   TextInputComponent,
   SelectMenuComponent,
   showModal,
} = require('discord-modals');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('nerman')
      .setDescription('Nerman Global Command Prefix')
      .addSubcommand(subcommand =>
         subcommand
            .setName('create-poll')
            .setDescription('Create a Yes/No/Abstain Poll')
      ),
   async execute(interaction) {
      console.log(
         'interaction.options._subcommand',
         interaction.options._subcommand
      );
      // console.log('INTERACTION.CLIENT', interaction.client);

      if (interaction.options._subcommand === 'create-poll') {
         const modal = new Modal().setCustomId('modal-create-poll').setTitle('Create Poll');

         // const pollType = new TextInputComponent()
         //    .setCustomId('pollType')
         //    .setLabel('Poll type')
         //    .setPlaceholder('nouncil / nouns')
         //    .setRequired(true)
         //    .setStyle('SHORT');

         const pollType = new SelectMenuComponent()
            .setCustomId('pollType')
            .setPlaceholder('Nouncil / Nouns')
            .addOptions(
               {
                  label: 'Nouncil',
                  description: 'Create a poll for nouncillors',
                  value: 'nouncil',
               },
               {
                  label: 'Nouns',
                  description: 'Create a poll for nouners',
                  value: 'nouns',
               }
            );

         const pollTitle = new TextInputComponent()
            .setCustomId('pollTitle')
            .setLabel('Title')
            .setPlaceholder('Prop #: Prop Title')
            .setRequired(true)
            .setStyle('SHORT');

         const pollDescription = new TextInputComponent()
            .setCustomId('pollDescription')
            .setLabel('Description')
            .setPlaceholder('- Total: 15,0 ETH \n- https://nouns.wtf/vote/#')
            .setRequired(false)
            .setStyle('LONG');

         const pollChoices = new TextInputComponent()
            .setCustomId('pollChoices')
            .setLabel('Choices')
            .setPlaceholder('Comma separated choices eg)Yes, No, Abstain')
            .setDefaultValue('Yes, No, Abstain')
            .setRequired(true)
            .setStyle('SHORT');

         modal.addComponents(
            pollType,
            pollTitle,
            pollDescription,
            pollChoices,
         );

         console.log({ modal });
         // console.log(modal.components[1], modal.components[1].components[0]);

         await showModal(modal, {
            client: interaction.client,
            interaction: interaction,
         });
      }
      // await interaction.reply({
      //    content: `Testing poll create maybe?`,
      //    ephemeral: true,
      // });
   },
};
