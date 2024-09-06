const { model, Schema } = require( "mongoose");

const nouncillorSchema = new Schema({
	discordId: {
		type: Schema.Types.String,
		required: true
	},
	walletAddress: {
		type: Schema.Types.String,
		required: false
	},
	twitterAddress: {
		type: Schema.Types.String,
		required: false
	},
	farcasterAddress: {
		type: Schema.Types.String,
		required: false
	},
	dateJoined: {
		type: Schema.Types.Date,
		required: false
	}
});

module.exports = model("Nouncillor", nouncillorSchema);
