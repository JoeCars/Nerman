const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType } = require('discord-api-types/v9');
const codeBlock = require('discord.js').Formatters.codeBlock;

const Poll = require('../../db/schemas/Poll');
const Vote = require('../../db/schemas/Vote');
const Logger = require('../../helpers/logger');

const fetchPoll = async interaction => {
   let targetPoll;
   try {
      targetPoll = await Poll.findOne({
         messageId: interaction.targetId,
         guildId: interaction.guildId,
      })
         .populate([
            {
               path: 'config',
            },
            {
               path: 'getVotes',
            },
         ])
         .exec();
   } catch (err) {
      Logger.error(
         'commands/context/exportPollReasons.js/fetchPoll(): Received an error.',
         {
            error: err,
         },
      );

      throw new Error(err.message);
   }

   if (!targetPoll) {
      throw new Error('There is no poll associated with this message ID.');
   }

   return targetPoll;
};

const attachUsernames = async (interaction, targetPoll) => {
   for (let i = 0; i < targetPoll.getVotes.length; ++i) {
      if (targetPoll.config.anonymous) {
         targetPoll.getVotes[i].username = 'anonymous';
      } else {
         const guildUser = await interaction.guild.members.fetch(
            targetPoll.getVotes[i].user,
         );
         targetPoll.getVotes[i].username = guildUser.user.username;
      }
   }
};

const extractPollResults = targetPoll => {
   const status = targetPoll.status;
   const numOfAbstains = targetPoll.abstains.size;

   // This approach allows multiple choices that can be any value.
   const votesForChoice = new Map();
   targetPoll.pollData.choices.forEach(choice => {
      votesForChoice.set(choice, []);
   });

   for (const vote of targetPoll.getVotes) {
      for (const choice of vote.choices) {
         votesForChoice
            .get(choice)
            .push({ username: vote.username, reason: vote.reason });
      }
   }

   return { status, numOfAbstains, votesForChoice };
};

const generatePollExport = ({ status, numOfAbstains, votesForChoice }) => {
   let output = `Poll Status: ${status}\n`;

   votesForChoice.forEach((votes, choice) => {
      output += `\n**${choice.toUpperCase()} - ${votes.length} VOTES**\n`;
      for (const vote of votes) {
         const hasNoReason = vote.reason.trim() === '';
         if (hasNoReason) {
            continue;
         }

         output += `\n**${vote.username}** | *"${vote.reason}"*\n`;
      }
   });

   output += `\n**ABSTAINS - ${numOfAbstains} VOTES**`;

   return output;
};

module.exports = {
   data: new ContextMenuCommandBuilder()
      .setName('Export Poll Reasons')
      .setType(ApplicationCommandType.Message),

   async execute(interaction) {
      Logger.info(
         'commands/context/exportPollReasons.js: Attempting to export poll reasons.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            targetMessageId: interaction.targetId,
         },
      );

      const targetPoll = await fetchPoll(interaction);
      await attachUsernames(interaction, targetPoll);

      const pollResults = extractPollResults(targetPoll);
      const markdown = generatePollExport(pollResults);

      interaction.reply({
         content: codeBlock(markdown),
         ephemeral: true,
      });

      Logger.info(
         'commands/context/exportPollReasons.js: Successfully exported poll reasons.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            targetMessageId: interaction.targetId,
         },
      );
   },

   attachUsernames: attachUsernames,
   extractPollResults: extractPollResults,
   generatePollExport: generatePollExport,
};
