async function dodo() {
    return 1;
}

module.exports.dodo = async function() {
    return dodo();
}