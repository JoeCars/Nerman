const { MessageEmbed, Message } = require('discord.js');
const { inlineCode, hyperlink } = require('@discordjs/builders');

const Poll = require('../../../db/schemas/Poll');

const shortenAddress = require('../../../helpers/nouns/shortenAddress');
const Logger = require('../../../helpers/logger');

const nounsGovId = process.env.NOUNS_GOV_ID;

module.exports = {
   name: 'propVoteCast',
   /**
    * @param {Message} interaction
    */
   async execute(message, vote) {
      try {
         Logger.info(
            'events/stateOfNouns/propVoteCast.js: Handling a proposal vote event.',
            {
               proposalId: Number(vote.proposalId),
               voterId: vote.voter.id,
               votes: Number(vote.votes),
               reason: vote.reason,
            },
         );

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

         const Nouns = await message.client.libraries.get('Nouns');
         const nounsGovChannel = await cache.get(nounsGovId);
         const supportEnum = ['AGAINST', 'FOR', 'ABSTAIN'];

         const propRegExp = new RegExp(`^prop\\s${Number(proposalId)}`, 'i');

         // const targetPolls = await Poll.find({
         //    'pollData.title': { $regex: propRegExp },
         // });
         // Poll.find({ 'pollData.title': { $regex: propRegExp })
         Logger.info(
            'events/stateOfNouns/propVoteCast.js: Checking vote data, proposalId and proposal RegExp.',
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
               'events/stateOfNouns/propVoteCast.js: Unable to find the associated poll.',
               {
                  proposalId: `${vote.proposalId}`,
                  voterId: vote.voter.id,
                  votes: `${vote.votes}`,
                  reason: vote.reason,
               },
            );
            return message.delete();
         }

         // const pollMessage = await (client.channels.cache

         // const titleRegex = new RegExp(/^#+\s+.+\n/);

         const titleRegex = new RegExp(
            /^(\#\s((\w|[0-9_\-+=.,!:`~%;_&$()*/\[\]\{\}@\\\|])+\s+)+(\w+\s?\n?))/,
         );
         // const titleRegex = new RegExp(
         //    /^(\#\s(\w+\s)+\s(\w+\s)+(\w+\s+\n?))/
         // );
         // # PropBox: A Nouns Proposal Incubator\n\n## TL;DR\n\nUsing lessons from a Nouncil trial program, we will set up a robust incubator that will help the best

         // Prop 175: PropBox: A Nouns Proposal Incubator
         // https://nouns.wtf/vote/175
         // Yes, No, Abstain

         // /^(\#\s((\w|[0-9_\-.,\|])+\s+)+(\w+\s?\n?))/
         // const extractedTitleFromFind = targetPolls[0].pollData.title
         //    .match(titleRegex)[0]
         //    .replaceAll(/^(#\s)|(\n+)$/g, '');
         // const extractedTitleFromFindOne = description
         //    .match(titleRegex)[0]
         //    .replaceAll(/^(#\s)|(\n+)$/g, '');

         // const titleFromFind = targetPolls[0].pollData.title;
         const titleFromPoll = targetPoll?.pollData.title ?? 'No poll title';

         Logger.debug(
            'events/stateOfNouns/propVoteCast.js: Checking poll title.',
            {
               proposalId: `${vote.proposalId}`,
               voterId: vote.voter.id,
               votes: `${vote.votes}`,
               reason: vote.reason,
               title: titleFromPoll,
            },
         );

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

         // l(pollMessage?.thread.hasThread);
         if (pollMessage !== null) {
            pollMessage.thread.send({
               content: null,
               embeds: [threadEmbed],
            });
         }

         Logger.info(
            'events/stateOfNouns/propVoteCast.js: Finished handling a proposal vote event.',
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
         Logger.error(
            'events/stateOfNouns/propVoteCast.js: Received an error.',
            {
               error: error,
            },
         );
      }
   },
};
