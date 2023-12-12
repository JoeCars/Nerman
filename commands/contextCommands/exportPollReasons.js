const {
   ContextMenuCommandBuilder,
   ApplicationCommandType,
} = require('discord.js');
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

const extractPollResults = async targetPoll => {
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

   const winner = await retrieveWinner(targetPoll);

   let title = `Poll Status: ${status}\n`;
   if (targetPoll.pollData && targetPoll.pollData.title) {
      title = targetPoll.pollData.title;
   }

   return { status, numOfAbstains, votesForChoice, winner, title };
};

const generatePollExport = ({
   status,
   numOfAbstains,
   votesForChoice,
   winner,
   title,
}) => {
   let output = `${title}\n`;

   output += `\nThe poll is ${status}.\n`;

   output += `\n${winner}\n`;

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

      const pollResults = await extractPollResults(targetPoll);
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

async function retrieveWinner(targetPoll) {
   const results = await targetPoll.results;
   let winningResult = 'Literally nobody voted on this :<';

   if (results.winner) {
      winningResult = `${
         results.winner[0].toUpperCase() + results.winner.substring(1)
      } - Wins`;
   }

   if (results.tied) {
      winningResult = `${results.tied
         .flatMap(arr => arr[0][0].toUpperCase() + arr[0].substring(1))
         .join(', ')} - Tied\nPoll inconclusive.`;
   }

   let failedChecks = [];

   if (results.quorumPass === false) {
      failedChecks.push('quorum');
   }

   if (results.thresholdPass === false) {
      failedChecks.push('vote threshold');
   }

   if (failedChecks.length > 0) {
      winningResult = `Poll failed to meet ${failedChecks.join(' and ')}.`;
   }

   return winningResult;
}
