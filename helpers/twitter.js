const Twit = require('twit');
const fetch = require('node-fetch');
const { UserManager } = require('discord.js');
let twitEnabled = true;

var T = new Twit({
	consumer_key: process.env.TWITTER_API_KEY,
	consumer_secret: process.env.TWITTER_API_KEY_SECRET,
	access_token: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
	timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
	strictSSL: true, // optional - requires SSL certificates to be valid.
});

try {
	T.get('account/verify_credentials', { skip_status: true }).catch(function (
		err
	) {
		twitEnabled = false;
	});
} catch (e) {
	twitEnabled = false;
}

/**
 * Formats Discord message content into Twitter friendly string.
 * @param  {String} content text content to include
 *
 * // @todo check username for associated Twitter handle
 * // @todo check message for usernames to replace, else remove @ sign
 * // maybe - if message truncated link to Discord thread
 */

async function formatTweet(content, user, mentions) {
	const lineBreak = '\r\n\r\n';
	const hash = '#nouns';
	const messageLimit = 280 - user.length - lineBreak.length - 1 - hash.length;

	// REGEX: { string start || space character }{ @ }{ non-space character }
	const atRegex = /(?<=\s|^)@(?=\S)/g;
	//REGEX:{ <@&&||! }{ 18 digits }{ > }
	const mentionRegex = /<@!?(\d{18})>/g;


	// remove occurence of @string
	let formattedContent = content.replaceAll(atRegex, '');

	formattedContent = formattedContent.replaceAll(mentionRegex, match => {
		match = match.replaceAll(/[<@!?|>]/g, '');
		match = mentions[match];
		return match;
	});

	content =
		`${user}${lineBreak}` +
		`${formatCustomEmojis(formattedContent).substring(
			0,
			messageLimit
		)} ${lineBreak}` +
		`${hash}`;

	return content;
}

/**
 * Discord exports custom emojis in content like this:  <a:custom_emoji:34232342343>
 * This will replace all custom emoji text with the name, like (custom_emoji)
 * @param  {String} str discord message content to format
 */
function formatCustomEmojis(str) {
	let regex = /\s*<\w*:(\w+):\w*>\s*/gi;
	let matched = str.matchAll(regex);

	for (const match of matched) {
		str = str.replace(match[0], ' (' + match[1] + ') ');
	}

	return str;
}

/**
 * Post a tweet with Nerman
 * @param  {String} content text content to include
 * @param  {Array} media array of strings with ids of media to include (optional)
 */

// @todo format content - character count, emojis, username tagging
// @todo test media type. All images. All videos. Look up what Discord and Twitter Support.
//      right now tested with 0-4 images (png, jpg, GIF). animated gifs work

// from twitter Tweet with media must have exactly 1 gif or video or up to 4 photos.
async function post(content, mediaUrls) {
	let mediaData = [];
	let params = { status: content };

	// formatting content - Emojis, Custom Emojis, unicode symbols

	if (mediaUrls) {
		mediaUrls = mediaUrls.slice(0, 4);
		for (const url of mediaUrls) {
			mediaData.push(await getBase64ImgString(url));
		}

		uploadImagesToTwitter(mediaData, [], function (mediaIdArray) {
			params.media_ids = mediaIdArray;
			tPost(params);
		});
	} else {
		tPost(params);
	}
}

/**
 * Internal method - posts the tweet using Twit.js
 * @param  {Array} params twitter params
 */

function tPost(params, callback) {
	T.post('statuses/update', params, function (err, data, response) {
		if (err) {
			console.log(err);
		}

		if (typeof callback === 'function') {
			callback();
		}
	});
}

/**
 * Get a base64 img string from the given url
 * @param  {String} url address of image
 */

async function getBase64ImgString(url) {
	//check error status and response code
	//check file types
	//check header for appropriate image types

	console.log(url);
	const response = await fetch(url);
	const buffer = await response.buffer();
	let media_data = buffer.toString('base64');

	return media_data;
}

/**
 * Uploads an image to Twitter, callsback with the associated Twitter media ID
 * @param  {String} media_data base64 encoded img string
 * @param  {function} callback will be called with img string
 */

function uploadImagesToTwitter(mediaDataArray, mediaIdArray, callback_final) {
	if (mediaDataArray === undefined || mediaDataArray == 0) {
		callback_final(mediaIdArray);
	} else {
		T.post(
			'media/upload',
			{ media_data: mediaDataArray.shift() },
			function (err, data, response) {
				let meta_params = { media_id: data.media_id_string };

				T.post(
					'media/metadata/create',
					meta_params,
					function (err, data, response) {
						if (!err) {
							mediaIdArray.push(meta_params['media_id']);

							uploadImagesToTwitter(
								mediaDataArray,
								mediaIdArray,
								callback_final
							);
						}
					}
				);
			}
		);
	}
}

module.exports.post = async function (content, mediaUrls) {
	if (twitEnabled) {
		await post(content, mediaUrls);
	}
};

module.exports.formatTweet = async function (content, user, mentions) {
	return await formatTweet(content, user, mentions);
};
