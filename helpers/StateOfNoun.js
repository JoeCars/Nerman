const TimeStuff = require('../helpers/timestuff.js');
const NounsDAO = require('../helpers/nounsdao.js');

const tickInterval = 10000;
let latestProposal = {
    "id":-1
};
let listenForNewProposals = false;
let listenForNewProposalsCallBack = null;

let events = [];

tick();

setInterval(() => {
  tick();
}, tickInterval); 



function tick() {

    await getLatestProposalData();
    for(events.length > 0){
        let curEvent = events.pop();
        if (curEvent == "new-proposal") {
            // POST VOTE TO DISCORD
        }
    }

    if(process.env.NODE_ENV == "development") { logTick(); }
}

function logTick(){

}

async function getLatestProposalData() {
    const data = await NounsDAO.getLatestProposal();

    if (latestProposal.id < 0) { latestProposal = data.proposals[0] }
    else if (latestProposal.id != data.proposals[0].id) {
        latestProposal = data.proposals[0];
        events.push("new-proposal"); // NEW DISCORD PROPOSAL - might have missed one if submitted exactly same time
        //calc difference between proposals, fire off getLatestNProposals(n)
    }
        
}

function addEventListener(event, callback){
    if(event == "new-proposal") {
        listenForNewProposals = true;
        listenForNewProposalsCallBack = callback;
    }
}

function removeEventListener(event, callback){
    if(event == "new-proposal") {
        listenForNewProposals = false;
        listenForNewProposalsCallback = null;
    }
}

module.exports.addEventListener = function (event, callback) {
    return addEventListener(event, callback);
};

module.exports.removeEventListener = function (event, callback) {
    return removeEventListener(event, callback);
};