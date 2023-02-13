const { MessageEmbed, Message } = require('discord.js');
const { inlineCode } = require('@discordjs/builders');

const Poll = require('../../db/schemas/Poll');

const shortenAddress = require('../../helpers/nouns/createNounEmbed');

const { log: l } = console;

const nounsGovId = process.env.NOUNS_GOV_ID;

module.exports = {
   name: 'propStatusChange',
   /**
    * @param {Message} interaction
    */
   async execute(message, statusChange, data) {
      try {
         l('PROP STATUS CHANGE EVENT HANDLER');

         const {
            guild: {
               channels,
               channels: { cache },
            },
         } = message;

         const { id: proposalId } = data;
         l('PROP STATUS CHANGE EVENT HANDLER');

         const Nouns = await message.client.libraries.get('Nouns');
         const nounsGovChannel =
            (await cache.get(nounsGovId)) ?? (await channels.fetch(nounsGovId));

         l({ message });
         l({ statusChange });
         l({ data });
         l({ nounsGovChannel });

         const propRegExp = new RegExp(`^prop\\s${Number(proposalId)}`, 'i');

         // const targetPolls = await Poll.find({
         //    'pollData.title': { $regex: propRegExp },
         // });
         // Poll.find({ 'pollData.title': { $regex: propRegExp })
         const targetPoll = await Poll.findOne({
            'pollData.title': { $regex: propRegExp },
         }).exec();

         l({ targetPoll });
         const propChannel =
            (await cache.get(targetPoll.channelId)) ??
            (await channels.fetch(targetPoll.channelId));

         const propMessage = await propChannel.messages.fetch(
            targetPoll.messageId
         );

         const messageThread = await propMessage.thread.fetch();
         // l({ targetPolls });

         // const titleFromFind = targetPolls[0].pollData.title;
         const titleFromFindOne = targetPoll.pollData.title;

         // l({ titleFromFind });
         l({ titleFromFindOne });

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

         // l('VOTE EMBED FIND\n', { voteEmbedFind });
         l('VOTE EMBED FIND ONE\n', { voteEmbedFindOne });

         // return await message.edit({ content: null, embeds: [voteEmbedFind] });

         await messageThread.send({ embeds: [pollThreadEmbed] });

         return await message.edit({
            content: null,
            embeds: [voteEmbedFindOne],
         });
      } catch (error) {
         console.error(error);
      }
   },
};
