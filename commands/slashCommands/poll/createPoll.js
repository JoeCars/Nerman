const {
   CommandInteraction,
   ModalBuilder,
   TextInputBuilder,
} = require('discord.js');
const { showModal } = require('discord-modals');
const Poll = require('../../../db/schemas/Poll');
const PollChannel = require('../../../db/schemas/PollChannel');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

module.exports = {
   subCommand: 'nerman.create-poll',
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/nerman/poll/createPoll.js: Starting to create polls.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );

      const {
         channelId,
         client,
         user: { id: userId },
         member: {
            roles: { cache: roleCache },
         },
         memberPermissions,
      } = interaction;

      const configExists = await PollChannel.configExists(channelId);

      // Test existence of channel configuration
      if (!configExists) {
         return interaction.reply({
            content:
               'There are no configurations registered to this channel. You may only register from a channel in which polling has been configured.',
            ephemeral: true,
         });
      }

      // Actually retrieve configuration
      // todo connect this to the GuildConfig from the collection
      const channelConfig = await PollChannel.findOne(
         { channelId },
         'maxUserProposal voteAllowance forAgainst allowedRoles',
      ).exec();

      const countedPolls = await Poll.countDocuments({
         config: channelConfig._id,
         creatorId: userId,
         status: 'open',
      });

      const shouldAuthorize = await needsAuthorization(
         channelConfig,
         interaction,
      );
      if (shouldAuthorize) {
         await authorizeInteraction(interaction, 2);
      } else {
         Logger.debug(
            'commands/poll/createPoll.js: User authorized with voting role.',
            {
               userId: userId,
               channelId: channelId,
               guildId: interaction.guildId,
            },
         );
      }

      if (countedPolls >= channelConfig.maxUserProposal) {
         throw new Error(
            `You have exceeded the maximum number (${channelConfig.maxUserProposal}) of active proposals permitted in this channel.`,
         );
      }

      // disabled until we nail down the cross-guild permissions on this command
      // if (
      //    !memberPermissions.has('MANAGE_GUILD') &&
      //    countedPolls >= channelConfig.maxUserProposal
      // ) {
      //    return interaction.reply({
      //       content:
      //          'You have exceeded the amount of allowed polls in this channel. You must wait until your current poll is closed.',
      //       ephemeral: true,
      //    });
      // }

      const modal = createPollModal(channelConfig);

      await showModal(modal, {
         client: client,
         interaction: interaction,
      });

      Logger.info(
         'commands/nerman/poll/createPoll.js: Finished creating poll.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );
   },
};

async function needsAuthorization(channelConfig, interaction) {
   for (const roleId of channelConfig.allowedRoles) {
      const guildUser = await interaction.guild.members.fetch(
         interaction.user.id,
      );
      const rolesCollection = guildUser.roles.valueOf();
      const role = rolesCollection.get(roleId);

      if (role) {
         return false;
      }
   }
   return true;
}

function createPollModal(channelConfig) {
   const modal = new ModalBuilder()
      .setCustomId('modal-create-poll')
      .setTitle('Create Poll');

   // const channelOptions = channelConfigs.map(
   //    ({ channelId, channelName }) => ({
   //       label: channelName,
   //       value: channelId,
   //    })
   // );
   // console.log(channelOptions);
   // const pollType = new SelectMenuComponent()
   //    .setCustomId('pollType')
   //    .setPlaceholder('Select Poll Channel')
   //    .addOptions(channelOptions)
   //    .setMinValues(1)
   //    .setMaxValues(1);
   // console.log(pollType);
   // return interaction.reply({
   // content: 'canceling this for testing purposes',
   // ephemeral: true,
   // });
   const createPollComponents = [];

   const pollTitle = new TextInputBuilder()
      .setCustomId('pollTitle')
      .setLabel('Title')
      .setPlaceholder('Poll title, or your main question.')
      .setStyle('SHORT')
      .setMaxLength(100)
      .setRequired(true);

   const pollDescription = new TextInputBuilder()
      .setCustomId('pollDescription')
      .setLabel('Description')
      .setPlaceholder(
         'Descriptive text, links, and any supporting details needed for users to decide on your poll.',
      )
      .setStyle('LONG')
      .setMaxLength(2000)
      .setRequired(false);

   const pollChoices = new TextInputBuilder()
      .setCustomId('pollChoices')
      .setLabel('Choices')
      .setPlaceholder(
         'Comma separated values. Minimum two options. eg) Yes, No, Abstain',
      )
      .setDefaultValue('Yes, No')
      .setStyle('SHORT')
      .setMaxLength(100)
      .setRequired(true);

   createPollComponents.push(pollTitle, pollDescription);

   if (!channelConfig.forAgainst) {
      createPollComponents.push(pollChoices);
   }

   if (channelConfig.voteAllowance) {
      const pollAllowance = new TextInputBuilder()
         .setCustomId('voteAllowance')
         .setLabel('Votes Per User')
         .setPlaceholder('# of votes is a single user allowed.')
         .setDefaultValue('1')
         .setRequired(true)
         .setMaxLength(2)
         .setStyle('SHORT');

      createPollComponents.push(pollAllowance);
   }

   modal.addComponents(createPollComponents);

   Logger.info(
      'commands/slashCommands/poll/createPoll.js: Finished creating poll modal.',
   );

   return modal;
}
