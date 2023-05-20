const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType } = require('discord-api-types/v9');
const codeBlock = require('discord.js').Formatters.codeBlock;

const Poll = require('../../db/schemas/Poll');
const Vote = require('../../db/schemas/Vote');
const Logger = require('../../helpers/logger');


const fetchPoll = async interaction => {
   let targetPoll;
   try {
      // TODO: The poll does NOT add vote IDs to the poll's database automatically.
      targetPoll = await Poll.findOne(
         {
            messageId: interaction.targetId,
            guildId: interaction.guildId,
         }
      )
         .populate('config')
         .exec()
//          .populate('_id') 
//          .populate('votes')
//          .populate('abstains')


   } catch (err) {
      Logger.error(
         'commands/context/exportPollReasons.js/fetchPoll(): Received an error.',
         {
            error: err,
         }
      );
     
      throw new Error(err.message);
   }

   if (!targetPoll) {
      throw new Error('There is no poll associated with this message ID.');
   }

   return targetPoll;
};

const fetchVotes = async targetPoll => {
   let votes;
   try {
      votes = await Vote.find({
         poll: targetPoll._id,
      })
         .populate('user')
         .exec();
   } catch (err) {
      Logger.error(
         'commands/context/exportPollReasons.js/fetchVotes(): Received an error.',
         {
            error: err,
         }
      );

      throw new Error(err.message);
   }

   return votes;
};

const attachUsernames = async (interaction, votes, targetPoll) => {
   for (let i = 0; i < votes.length; ++i) {
      if (targetPoll.config.anonymous) {
         votes[i].username = 'anonymous';
      }
      else {
         const guildUser = await interaction.guild.members.fetch(votes[i].user);
         votes[i].username = guildUser.user.username;
      }
   }
};

const extractPollResults = (targetPoll, votes) => {
   const status = targetPoll.status;
   const numOfAbstains = targetPoll.abstains.size;


   // This approach allows multiple choices that can be any value.
   const votesForChoice = new Map();
   targetPoll.pollData.choices.forEach(choice => {
      votesForChoice.set(choice, []);
   });

   for (const vote of votes) {
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
         }
      );
     
      // TODO: Rename this to something more appropriate.
      const authorizedIds = process.env.BAD_BITCHES.split(',');
      if (!authorizedIds.includes(interaction.user.id)) {
         throw new Error('You do not have permission to use this command.');
      }

      const targetPoll = await fetchPoll(interaction);
      const votes = await fetchVotes(targetPoll);
      await attachUsernames(interaction, votes, targetPoll);

      const pollResults = extractPollResults(targetPoll, votes);
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
         }
      );

   },

   attachUsernames: attachUsernames,
   extractPollResults: extractPollResults,
   generatePollExport: generatePollExport,
};
