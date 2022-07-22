const TimeStuff = require('../helpers/timestuff.js');
const NounsDAO = require('../helpers/nounsdao.js');

const tickInterval = 10000;
var latestProposal = {
    "id":-1
};

const logs = (process.env.NODE_ENV == "development");

var activeEventListeners = [];
// eventListener {
//   type
//   callbacks   
// }

var eventStack = [];
// event {
//   type
//   data
//}



tick();

setInterval(() => {
  tick();
}, tickInterval); 



async function tick() {
    if(logs){logTick()};

    await getLatestProposalData();
    await processEventStack();

}

async function logTick(){   

    // Show Active Event Listeners
    console.log("activeEventListeners"+activeEventListeners);

}

async function getLatestProposalData() {

    if(isEventListeningActive("new-proposal")){

        const data = await NounsDAO.getLatestProposals(1);

        if (latestProposal.id < 0) { 
            latestProposal = data.proposals[0];

            console.log("setting initial proposal to PROP " + data.proposals[0].id);

        } else if (latestProposal.id != data.proposals[0].id) {
            let diffID = latestProposal.id - data.proposals[0].id;
            let proposals = data.proposals;
            
            if( diffID > 1 ){
                proposals = await NounsDAO.getLatestProposals(diffID).proposals;
                proposals.reverse();
            }
    
            proposals.forEach(function (prop) {
    
                scheduleEvent("new-proposal", prop)
                latestProposal = prop;

            });
    
        }

    }
        
}

function scheduleEvent(eventType, data){

    eventStack.push({
        'type':'eventType',
        'data': data
    }); 

    console.log("scheduling event "+ eventType + " with " + JSON.stringify(data));

}


function processEventStack(){

    while(eventStack.length > 0){
        let curEvent = eventStack.shift();
        if (curEvent.type == "new-proposal") {


            // POST VOTE TO DISCORD
        }
    }

}

function isEventTypeValid(eventType) {
    if (eventType == "new-proposal") {
        return true;
    } else {
        return false;
    }
}

function isEventListeningActive(eventType){

    const eventListenerExists = activeEventListeners.some(function(activeEvent){
        return activeEvent.type === eventType;
    });

    return eventListenerExists;

}

function addEventListener(eventType, callback){

    if(isEventTypeValid(eventType)){
        if(!isEventListeningActive(eventType)){
            activeEventListeners.push({
                "type" : eventType,
                "callbacks" : []
            });
        }

        const i = activeEventListeners.findIndex(x => x.type === eventType);
        activeEventListeners[i].callbacks.push(callback);

        console.log("addEventListener: " + eventType);
    }
}

function clearEventListeners(eventType, callback){
    
    if(isEventTypeValid(eventType)) {

        if(isEventListeningActive(eventType)){

            activeEventListeners.forEach(function (activeEvent, i) {
                if(eventType == activeEvent){
                    activeEventListeners.splice(i, 1);
                }
            });

        }

    }
}

module.exports.addEventListener = function (eventType, callback) {
    return addEventListener(eventType, callback);
};

module.exports.clearEventListeners = function (eventType) {
    return clearEventListeners(eventType);
};