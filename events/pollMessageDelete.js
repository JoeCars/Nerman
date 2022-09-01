const { MessageEmbed } = require('discord.js');

const PollChannel = require('../db/schemas/PollChannel');
const Poll = require('../db/schemas/Poll');

const { logToObject } = require('../utils/functions');

const { log: l, time: t, timeEnd: te } = console;

module.exports = {
   name: 'messageDelete',
   async execute(message) {
      const { channelId, id: messageId } = message;

      // t('checkSpeed');
      // if (!PollChannel.countDocuments({ channelId })) return;
      // if (!Poll.countDocuments({ messageId })) return;
      // if (oldEmbeds[0].equals(newEmbeds[0])) return;
      // te('checkSpeed');
      // t('timeChecks');

      // console.log({ oldEmbeds });
      // console.log({ newEmbeds });
      if (
         !PollChannel.countDocuments({ channelId }) ||
         !Poll.countDocuments({ messageId })
      )
         return;

      const messagePoll = await Poll.findOneAndDelete({ messageId });

      l({ messagePoll });

      l(await Poll.countDocuments({ messageId }));



      // l(oldEmbeds[0]);
      // l(newEmbeds[0]);

      // l(!!oldEmbeds[0]);
      // l(!!newEmbeds[0]);

      // l(oldEmbeds[0].equals(newEmbeds[0]));

      // console.log({ oldMessage, newMessage });

      // console.log(oldMessage.embeds[0], !!oldMessage.embeds[0]);
      // console.log(newMessage.embeds[0], !!newMessage.embeds[0]);
      // console.log(type);
      // console.log(
      //    'interaction.isChatInputCommand()',
      //    interaction.isChatInputCommand()
      // );
      // console.log(
      //    'interaction.isMessageComponent()',
      //    interaction.isMessageComponent()
      // );
      // console.log(
      //    'interaction.isContextMenuCommand()',
      //    interaction.isContextMenuCommand()
      // );
      // console.log(
      //    'interaction.isMessageContextMenuCommand()',
      //    interaction.isMessageContextMenuCommand()
      // );
      // if (!interaction.isCommand()) return;

      // const command = interaction.client.commands.get(interaction.commandName);

      // if (!command) return;

      // try {
      //    // console.time('Interaction Timer');

      //    await command.execute(interaction);
      //    // console.timeEnd('Interaction Timer');
      // } catch (error) {
      //    console.error(error);

      //    if (interaction.deferred) {
      //       console.log('INTERACTION CREATE DEFERRED');
      //       await interaction.editReply({
      //          content:
      //             error.message ||
      //             'There was an error while executing this command!',
      //          ephemeral: true,
      //       });
      //    } else {
      //       console.log('INTERACTION CREATE NOT DEFERRED');
      //       await interaction.reply({
      //          content:
      //             error.message ||
      //             'There was an error while executing this command!',
      //          ephemeral: true,
      //       });
      //    }
      //    console.timeEnd('Interaction Timer');
      // }
   },
};
