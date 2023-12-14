const Logger = require('./logger');
const NounsProposalForum = require('../db/schemas/NounsProposalForum');
const NounsCandidateForum = require('../db/schemas/NounsCandidateForum');
const UrlConfig = require('../db/schemas/UrlConfig');
const { TextChannel, hideLinkEmbed } = require('discord.js');

const MAX_THREAD_NAME_LENGTH = 96;

// https://discord.com/developers/docs/topics/opcodes-and-status-codes
const UNKNOWN_CHANNEL_ERROR_CODE = 10003;

/**
 * @param {NounsProposalForum | NounsCandidateForum} forum
 * @param {Client} client
 */
exports.fetchForumChannel = async function fetchForumChannel(forum, client) {
   let channel = undefined;
   try {
      const guild = await client.guilds.fetch(forum.guildId);
      channel = await guild.channels.fetch(forum.channelId);
   } catch (error) {
      Logger.error('helpers/forum.js: Cannot find nouns forum channel.', {
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
      const url = (await UrlConfig.fetchUrls(channel.guildId)).propUrl;

      let threadName = data.proposalTitle ?? `Proposal ${proposalId}`;
      threadName = threadName.split(' ').slice(1).join(' '); // Removing 'Proposal'.

      if (threadName.length >= MAX_THREAD_NAME_LENGTH) {
         threadName =
            threadName.substring(0, MAX_THREAD_NAME_LENGTH).trim() + '...';
      }

      thread = await channel.threads.create({
         name: threadName,
         message: {
            content: hideLinkEmbed(`${url}${proposalId}`),
         },
      });
      forum.threads.set(proposalId, thread.id);
      await forum.save();
   }

   return thread;
};

/**
 * @param {string} slug
 * @param {NounsCandidateForum} forum
 * @param {TextChannel} channel
 * @param {{proposer: {id: string}, slug: string}} data
 */
exports.fetchCandidateForumThread = async function (
   slug,
   forum,
   channel,
   data,
) {
   // Formatting slug, because MongoDB doesn't accept map keys with ".".
   slug = slug.replace(/\./g, ',');

   let thread = undefined;
   try {
      if (forum.threads.get(slug)) {
         thread = await channel.threads.fetch(forum.threads.get(slug));
      }
   } catch (error) {
      Logger.error('helpers/forum.js: Received a candidate thread error.', {
         error: error,
         guildId: channel.guildId,
         channelId: channel.id,
      });
   }

   if (!thread) {
      const url = `https://nouns.wtf/candidates/${data.proposer.id.toLowerCase()}-${
         data.slug
      }`;

      let threadName = data.slug
         .trim()
         .split('-')
         .filter(word => {
            return word.trim();
         })
         .map(word => {
            return word[0].toUpperCase() + word.substring(1).toLowerCase();
         })
         .join(' ');

      if (threadName.length >= MAX_THREAD_NAME_LENGTH) {
         threadName =
            threadName.substring(0, MAX_THREAD_NAME_LENGTH).trim() + '...';
      }

      thread = await channel.threads.create({
         name: threadName,
         message: {
            content: hideLinkEmbed(url),
         },
      });
      forum.threads.set(slug, thread.id);
      await forum.save();
   }

   return thread;
};
