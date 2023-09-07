const Logger = require('./logger');
const NounsProposalForum = require('../db/schemas/NounsProposalForum');
const UrlConfig = require('../db/schemas/UrlConfig');
const Proposal = require('../db/schemas/Proposal');
const { TextChannel } = require('discord.js');
const { hideLinkEmbed } = require('@discordjs/builders');
const {
   generateInitialForumMessage,
} = require('../views/embeds/forum/forumInitialMessage');

// https://discord.com/developers/docs/topics/opcodes-and-status-codes
const UNKNOWN_CHANNEL_ERROR_CODE = 10003;

/**
 * @param {NounsProposalForum} forum
 * @param {Client} client
 */
exports.fetchForumChannel = async function fetchForumChannel(forum, client) {
   let channel = undefined;
   try {
      const guild = await client.guilds.fetch(forum.guildId);
      channel = await guild.channels.fetch(forum.channelId);
   } catch (error) {
      Logger.error('events/ready.js: Cannot find nouns forum channel.', {
         error: error,
         guildId: forum.guildId,
         channelId: forum.channelId,
      });
      if (error.code === UNKNOWN_CHANNEL_ERROR_CODE) {
         forum.isDeleted = true;
         await forum.save();
      }
   }
   return channel;
};

/**
 * @param {string} proposalId
 * @param {NounsProposalForum} forum
 * @param {TextChannel} channel
 * @param {object} data
 */
exports.fetchForumThread = async function fetchForumThread(
   proposalId,
   forum,
   channel,
   data,
) {
   let thread = undefined;
   try {
      if (forum.threads.get(proposalId)) {
         thread = await channel.threads.fetch(forum.threads.get(proposalId));
      }
   } catch (error) {
      Logger.error('events/ready.js: Received a thread error.', {
         error: error,
         guildId: channel.guildId,
         channelId: channel.id,
      });
   }

   if (!thread) {
      const proposal = await Proposal.findOne({
         proposalId: parseInt(proposalId),
      });

      const url = (await UrlConfig.fetchUrls(channel.guildId)).propUrl;

      thread = await channel.threads.create({
         name: data.proposalTitle ?? `Proposal ${proposalId}`,
         message: {
            content: hideLinkEmbed(`${url}${proposalId}`),
         },
      });
      forum.threads.set(proposalId, thread.id);
      await forum.save();
   }

   return thread;
};
