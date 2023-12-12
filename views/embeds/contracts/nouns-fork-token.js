const { EmbedBuilder, hyperlink, inlineCode } = require('discord.js');

const DEFAULT_MINT_ID = '0x0000000000000000000000000000000000000000';

/**
 *
 * @param {{
 *    from: {id: string, name: string},
 *    to: {id: string, name: string},
 *    tokenId: string}} data
 * @param {boolean} hasMarkdown
 */
exports.generateTransferForkNounEmbed = function (data, hasMarkdown = true) {
   let title = `Transfer | Noun ${data.tokenId}`;
   if (data.from.id === data.to.id) {
      title = `Stanky Shameless Washing | Noun ${data.tokenId}`;
   } else if (data.from.id === DEFAULT_MINT_ID) {
      title = `Mint | Noun ${data.tokenId}`;
   }
   title = `Fork 0 | ${title}`;

   let fromWallet = data.from.name;
   let toWallet = data.to.name;
   if (hasMarkdown) {
      fromWallet = hyperlink(
         fromWallet,
         `https://etherscan.io/address/${data.from.id}`,
      );
      toWallet = hyperlink(
         toWallet,
         `https://etherscan.io/address/${data.to.id}`,
      );
   }
   const description = `From ${fromWallet} to ${toWallet}`;

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setImage(`http://noun.pics/${data.tokenId}.png`);
   return embed;
};

exports.generateForkDelegateChangedEmbed = function (data, hasMarkdown = true) {
   const title = 'Fork 0 | Delegate Changed';
   const titleUrl = `https://etherscan.io/tx/${data.event.transactionHash}`;

   let delegator = data.delegator.name;
   let newDelegate = data.toDelegate.name;
   let voteCount = data.numOfVotesChanged;

   if (hasMarkdown) {
      delegator = hyperlink(
         delegator,
         `https://etherscan.io/address/${data.delegator.id}`,
      );
      newDelegate = hyperlink(
         newDelegate,
         `https://etherscan.io/address/${data.toDelegate.id}`,
      );
      voteCount = inlineCode(voteCount);
   }

   const message = `${delegator} delegated ${voteCount} votes to ${newDelegate}.`;

   const embed = new EmbedBuilder()
      .setTitle(title)
      .setColor('#00FFFF')
      .setDescription(message);

   if (hasMarkdown) {
      embed.setURL(titleUrl);
   }

   return embed;
};

exports.generateForkNounCreatedEmbed = function (data) {
   const title = `Fork 0 | Noun Created | Noun ${data.id}`;

   const titleUrl = `https://nouns.wtf/noun/${data.id}`;

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(title)
      .setURL(titleUrl)
      .setDescription(
         `${data.id % 10 !== 0 ? 'Auction Created' : "Nounder's Noun"}`,
      )
      .setImage(`http://noun.pics/${data.id}.png`);

   return embed;
};
