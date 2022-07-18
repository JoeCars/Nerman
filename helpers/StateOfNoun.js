const TimeStuff = require('../helpers/timestuff.js');
const NounsDAO = require('../helpers/nounsdao.js');

const tickInterval = 10000;
var latestProposal = {
    "id":-1
};

var listenForNewProposals = false;
var listenForNewProposalsCallBack = null;

var events = [];

tick();

setInterval(() => {
  tick();
}, tickInterval); 



function tick() {

    await getLatestProposalData();
    while(events.length > 0){
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
    const data = await NounsDAO.getLatestProposals(1);

    if (latestProposal.id < 0) { latestProposal = data.proposals[0] }
    else if (latestProposal.id != data.proposals[0].id) {
        let diffID = latestProposal.id - data.proposals[0].id;
        let proposals = data.proposals;
        if( diffID > 1 ){
            proposals = await NounsDAO.getLatestProposals(diffID).proposals;
        }

        proposals.forEach(function (prop, i) {

            events.push({
                'type':'new-proposal',
                'data':prop
            }); 
            latestProposal = prop; // Is this correct? Needs to be one with highest number. Possibly sort proposals first
        });

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