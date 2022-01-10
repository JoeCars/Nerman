// var request = require('request').defaults({ encoding: null });

async function getThreshold() {
    //https://stackoverflow.com/questions/51584028/online-user-count-from-a-discord-role
    return 1;
}

module.exports.getThreshold = async function() {
    return getThreshold();
}