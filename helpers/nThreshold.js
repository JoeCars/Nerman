// var request = require('request').defaults({ encoding: null });

function getThreshold(usersOnline) {
	// console.log("THRESHOLD AT 1: " + calcThreshold(1));
	// console.log("THRESHOLD AT 2: " + calcThreshold(2));
	// console.log("THRESHOLD AT 5: " + calcThreshold(5));
	// console.log("THRESHOLD AT 10: " + calcThreshold(10));
	// console.log("THRESHOLD AT 1000: " + calcThreshold(1000));
	// console.log("THRESHOLD AT 30000: " + calcThreshold(30000));

	return calcThreshold(usersOnline);
}

function calcThreshold(x) {
	let y = 0.25 * x * (1 - x / (x + 2500));

    // for testing purposes
	return 1;
	return 2;
	return Math.ceil(y);
}

module.exports.getThreshold = function (usersOnline) {
	return getThreshold(usersOnline);
};
