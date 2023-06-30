const { MessageEmbed, TextChannel } = require('discord.js');
const { inlineCode, hyperlink } = require('@discordjs/builders');

const Poll = require('../../../db/schemas/Poll');

const shortenAddress = require('../../../helpers/nouns/shortenAddress');
const Logger = require('../../../helpers/logger');
const { createInitialVoteEmbed } = require('../../../helpers/proposalHelpers');

module.exports = {
   name: 'propVoteCast',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, vote) {
      try {
         Logger.info(
            'events/nouns/propVoteCast.js: Handling a proposal vote event.',
            {
               proposalId: Number(vote.proposalId),
               voterId: vote.voter.id,
               votes: Number(vote.votes),
               reason: vote.reason,
            },
         );

         const Nouns = await channel.client.libraries.get('Nouns');
         const initialVoteEmbed = await createInitialVoteEmbed(vote, Nouns);
         const message = await channel.send({
            content: null,
            embeds: [initialVoteEmbed],
         });

         const {
            guild: {
               channels: { cache },
            },
            channelId, // for evaluating embedTitle
            client,
         } = message;

         const {
            proposalId,
            voter: { id: voterId },
            votes,
            supportDetailed,
            reason,
            // proposal: { description },
         } = vote;

         const supportEnum = ['AGAINST', 'FOR', 'ABSTAIN'];

         const propRegExp = new RegExp(`^prop\\s${Number(proposalId)}`, 'i');

         Logger.info(
            'events/nouns/propVoteCast.js: Checking vote data, proposalId and proposal RegExp.',
            {
               vote: vote,
               proposalId: {
                  propIdRaw: proposalId ?? 'Unable to log',
                  propIdNum: Number(proposalId) ?? 'Unable to log',
                  propIdStr: `${proposalId ?? 'Unable to log'}`,
                  propIdNumToStr: `${Number(proposalId) ?? 'Unable to log'}`,
               },
               propRegExp: propRegExp,
            },
         );

         const targetPoll = await Poll.findOne({
            'pollData.title': { $regex: propRegExp },
         })
            .populate('config')
            .exec();

         let pollChannelId;
         let pollMessage = null;

         if (targetPoll) {
            pollChannelId = targetPoll.config.channelId;
            pollMessage = await (client.channels.cache
               .get(pollChannelId)
               .messages.cache.get(targetPoll.messageId) ??
               client.channels.cache
                  .get(pollChannelId)
                  .messages.fetch(targetPoll.messageId));
         } else {
            Logger.warn(
               'events/nouns/propVoteCast.js: Unable to find the associated poll.',
               {
                  proposalId: `${vote.proposalId}`,
                  voterId: vote.voter.id,
                  votes: `${vote.votes}`,
                  reason: vote.reason,
               },
            );
            return message.delete();
         }

         const titleFromPoll = targetPoll?.pollData.title ?? 'No poll title';

         Logger.debug('events/nouns/propVoteCast.js: Checking poll title.', {
            proposalId: `${vote.proposalId}`,
            voterId: vote.voter.id,
            votes: `${vote.votes}`,
            reason: vote.reason,
            title: titleFromPoll,
         });

         // todo change this back when we have the config stuff sorted out
         // const titleUrl = `https://nouns.wtf/vote/${proposalId}`;
         let titleUrl;
         // todo change this DEPLOY_STAGE to 'production' when testing passes
         // if (process.env.DEPLOY_STAGE === 'development') {
         if (process.env.DEPLOY_STAGE === 'production') {
            titleUrl =
               channelId !== process.env.AGORA_CHANNEL_ID
                  ? `https://nouns.wtf/vote/${proposalId}`
                  : `https://www.nounsagora.com/proposals/${proposalId}`;
         }

         const voter =
            (await Nouns.ensReverseLookup(voterId)) ??
            (await shortenAddress(voterId));
         const voterUrl = `https://etherscan.io/address/${voterId}`;
         const voterHyperlink = `[${voter}](${voterUrl})`;
         const propHyperlink = hyperlink(
            `Prop ${proposalId}`,
            `https://nouns.wtf/vote/${proposalId}`,
         );

         // const title =
         //    'Test Title String Until I Discover Where This Should Come from ';
         // const title = description
         //    .match(titleRegex)[0]
         //    .replaceAll(/^(#\s)|(\n+)$/g, '');
         // l('propVoteCast.js : \n', { title });

         // const titleHyperlink = `[Prop ${proposalId} - ${title}](https://nouns.wtf/vote/${proposalId})`;
         // const titleHyperlinkFind = `[${titleFromFind}](https://nouns.wtf/vote/${proposalId})`;
         // const titleHyperlinkFindOne = `[${titleFromPoll}](https://nouns.wtf/vote/${proposalId})`;
         // const titleHyperlinkFindOne = hyperlink(titleFromPoll, titleUrl);
         // const description = `https://nouns.wtf/vote/${propId}`;
         // l('propVoteCast.js : \n',{ titleHyperlink });
         // l('propVoteCast.js : \n', { titleHyperlinkFind });
         // l('propVoteCast.js : \n', { titleHyperlinkFindOne });

         // const intRegex = new RegExp(/^\d*$/);

         // console.log({ everyoneId });
         // console.log(channelConfig.allowedRoles);

         // const messageObject = await initPollMessage({
         //    propId,
         //    title,
         //    description,
         //    channelConfig,
         //    everyoneId,
         // });

         // console.log(
         //    '-----------------------------------------------\n',
         //    messageObject.embeds,
         //    '-----------------------------------------------\n'
         // );

         // const voteEmbed = new MessageEmbed()
         //    .setTitle(titleHyperlink)
         //    .setDescription(
         //       `${voterHyperlink} voted ${supportEnum[supportDetailed]}${
         //          supportEnum[supportDetailed] !== 'ABSTAIN'
         //             ? ' with ' + votes + ' votes'
         //             : ''
         //       }\n\u200B\u200B${reason}`
         //    );
         // const voteEmbedFind = new MessageEmbed()
         //    .setTitle(titleHyperlinkFind)
         //    .setDescription(
         //       `${voterHyperlink} voted ${supportEnum[supportDetailed]}${
         //          supportEnum[supportDetailed] !== 'ABSTAIN'
         //             ? ' with ' + Number(votes) + ' votes'
         //             : ''
         //       }\n\u200B\u200B${reason}`
         //    );

         const voteEmbed = new MessageEmbed()
            .setColor('#00FFFF')
            .setTitle(`${titleFromPoll}`)
            .setURL(titleUrl)
            .setDescription(
               `${voterHyperlink} voted ${inlineCode(
                  supportEnum[supportDetailed],
               )} with ${inlineCode(Number(votes))} votes. ${
                  !!reason.trim() ? `\n\n${reason}` : ''
               }`,
            );

         const threadEmbed = new MessageEmbed()
            .setColor('#00FFFF')
            .setDescription(
               `${voterHyperlink} voted ${inlineCode(
                  supportEnum[supportDetailed],
               )} with ${inlineCode(
                  Number(votes),
               )} votes on ${propHyperlink}. ${
                  !!reason.trim() ? `\n\n${reason}` : ''
               }`,
            );

         // const pollData = {
         //    title,
         //    description,
         //    voteAllowance: 1,
         //    choices: ['yes', 'no', 'abstain'],
         // };

         // Checking if this is intended for Nouncil or not.
         if (
            pollMessage !== null &&
            message.guildId === process.env.DISCORD_GUILD_ID
         ) {
            pollMessage.thread.send({
               content: null,
               embeds: [threadEmbed],
            });
         }

         Logger.info(
            'events/nouns/propVoteCast.js: Finished handling a proposal vote event.',
            {
               proposalId: `${vote.proposalId}`,
               voterId: vote.voter.id,
               votes: `${vote.votes}`,
               reason: vote.reason,
            },
         );

         return await message.edit({
            content: null,
            embeds: [voteEmbed],
         });
      } catch (error) {
         Logger.error('events/nouns/propVoteCast.js: Received an error.', {
            error: error,
         });
      }
   },
};
