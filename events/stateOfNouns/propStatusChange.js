const { MessageEmbed, Message } = require('discord.js');
const { inlineCode } = require('@discordjs/builders');

const Poll = require('../../db/schemas/Poll');

const shortenAddress = require('../../helpers/nouns/createNounEmbed');
const Logger = require('../../helpers/logger');

const nounsGovId = process.env.NOUNS_GOV_ID;

module.exports = {
   name: 'propStatusChange',
   /**
    * @param {Message} interaction
    */
   async execute(message, statusChange, data) {
      try {
         Logger.info(
            'events/stateOfNouns/propStatusChange.js: Handling a proposal change event.',
            {
               proposalId: data.id,
            }
         );

         const {
            guild: {
               channels,
               channels: { cache },
            },
         } = message;

         const { id: proposalId } = data;

         const Nouns = await message.client.libraries.get('Nouns');
         const nounsGovChannel =
            (await cache.get(nounsGovId)) ?? (await channels.fetch(nounsGovId));

         const propRegExp = new RegExp(`^prop\\s${Number(proposalId)}`, 'i');

         // const targetPolls = await Poll.find({
         //    'pollData.title': { $regex: propRegExp },
         // });
         // Poll.find({ 'pollData.title': { $regex: propRegExp })
         const targetPoll = await Poll.findOne({
            'pollData.title': { $regex: propRegExp },
         })
            .populate('config')
            .exec();

         const propChannel =
            (await cache.get(targetPoll.config.channelId)) ??
            (await channels.fetch(targetPoll.config.channelId));

         const propMessage = await propChannel.messages.fetch(
            targetPoll.messageId
         );

         const messageThread = await propMessage.thread.fetch();

         const titleFromFindOne = targetPoll.pollData.title;

         Logger.debug(
            "events/stateOfNouns/propStatusChange.js: Checking the target poll's title.",
            {
               title: titleFromFindOne,
            }
         );

         // const { id } = data;
         // const titleRegex = new RegExp(/^#+\s+.+\n/);

         // const titleRegex = new RegExp(
         //    /^(\#\s((\w|[0-9_\-+=.,!:`~%;_&$()*/\[\]\{\}@\\\|])+\s+)+(\w+\s?\n?))/
         // );

         // const title = description
         //    .match(titleRegex)[0]
         //    .replaceAll(/^(#\s)|(\n+)$/g, '');
         // l({ title });

         // const titleHyperlink = `Prop ${proposalId} - [${voter}](https://nouns.wtf/vote/${proposalId})`;
         // const description = `https://nouns.wtf/vote/${propId}`;
         // l({ titleHyperlink });

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

         // const voteEmbedFind = new MessageEmbed()
         //    .setTitle(titleFromFind)
         //    .setDescription(
         //       `https://nouns.wtf/vote/${proposalId}\n${statusChange}`
         //    );
         const voteEmbedFindOne = new MessageEmbed()
            .setTitle(titleFromFindOne)
            .setDescription(
               `https://nouns.wtf/vote/${proposalId}\n${statusChange}`
            );

         const pollThreadEmbed = new MessageEmbed()
            .setColor('#00FFFF')
            .setDescription(
               `Proposal status changed to ${inlineCode(statusChange)}`
            );

         await messageThread.send({ embeds: [pollThreadEmbed] });

         Logger.info(
            'events/stateOfNouns/propStatusChange.js: Finished handling a proposal change event.',
            {
               proposalId: data.id,
            }
         );

         return await message.edit({
            content: null,
            embeds: [voteEmbedFindOne],
         });
      } catch (error) {
         Logger.error(
            'events/stateOfNouns/propStatusChange.js: Received an error.',
            {
               error: error,
            }
         );
      }
   },
};
