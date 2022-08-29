const TimeStuff = require('../helpers/timestuff.js');
const NounsDAO = require('../helpers/nounsdao.js');
const { logToObject} = require('../utils/functions.js')

const tickInterval = 1800000;
var latestProposal = {
   id: -1,
};

const logs = process.env.NODE_ENV == 'development';

var activeEventListeners = [];
// eventListener {
//   type
//   callbacks
// }

var eventQueue = [];
// event {
//   type
//   data
//}

tick();

setInterval(() => {
   tick();
}, tickInterval);

async function tick() {
   if (logs) {
      logTick('start');
   }

   await getLatestProposalData();

   if (logs) {
      logTick('mid');
   }

   await processEventQueue();

   if (logs) {
      logTick('end');
   }
}

async function logTick(state) {
   let seperator = '';
   switch (state) {
      case 'start':
         var date = new Date();

         console.log('\n');
         console.log('StateOfNoun.js --- ' + date.toUTCString());

         let listenerString = '';
         activeEventListeners.forEach(function (eventListener) {
            listenerString += seperator + eventListener.type;
            seperator = ',';
         });
         console.log('------------------------------------------------');
         console.log('| EVENT LISTENERS - POLL NOUNS DATA');
         console.log('------------------------------------------------');
         console.log('| activeEventListeners: [' + listenerString + ']');
         console.log('|');
         break;
      case 'mid':
         let eventString = '';
         eventQueue.forEach(function (event) {
            eventString += seperator + event.type;
            seperator = ',';
         });
         console.log('| ');
         console.log('------------------------------------------------');
         console.log('| EVENTS - PROCESS QUEUE');
         console.log('------------------------------------------------');
         console.log('| eventQueue [' + eventString + ']');
         console.log('| ');
         break;
      case 'end':
         console.log('------------------------------------------------');
   }
}

async function getLatestProposalData() {
   if (isEventListeningActive('new-proposal')) {
      const data = await NounsDAO.getLatestProposals(1, 'desc');

      if (latestProposal.id < 0) {
         latestProposal = data.proposals[0];

         // TEMP CODE, FORCES NEXT ONE TO BE VIEWED AS NEW PROPOSAL
         // latestProposal.id = latestProposal.id - 2;

         console.log(
            '| new-proposal init - setting latest prop to ' +
               data.proposals[0].id
         );
         console.log('| Logging Data ' + JSON.stringify(data.proposals[0]));
         console.log('| Logging Data ' + logToObject(data.proposals[0]));
      } else if (latestProposal.id != data.proposals[0].id) {
         let newProposalCount = data.proposals[0].id - latestProposal.id;
         let proposals = data.proposals;

         console.log('| new proposal(s): ' + newProposalCount);
         console.log({ data });
         if (newProposalCount > 1) {
            const dataNew = await NounsDAO.getLatestProposals(
               newProposalCount,
               'desc'
            );
            proposals = dataNew.proposals;
         }

         for (let i = proposals.length - 1; i >= 0; i--) {
            const prop = proposals[i];
            scheduleEvent('new-proposal', prop);
         }

         latestProposal = proposals[0];
      }
   }
}

function scheduleEvent(eventType, data) {
   eventQueue.push({
      type: eventType,
      data: data,
   });

   console.log('| scheduling event ' + eventType + ' ' + data.id);
   console.log('| scheduling event ' + eventType + ' ' + data);
}

function processEventQueue() {
   while (eventQueue.length > 0) {
      const curEvent = eventQueue.shift();
      const callbacks = activeEventListeners.find(
         e => e.type == curEvent.type
      ).callbacks;

      callbacks.forEach(function (callback) {
         callback(curEvent.data);
      });
   }
}

function isEventTypeValid(eventType) {
   if (eventType == 'new-proposal') {
      return true;
   } else {
      return false;
   }
}

function isEventListeningActive(eventType) {
   const eventListenerExists = activeEventListeners.some(function (
      activeEvent
   ) {
      return activeEvent.type === eventType;
   });

   return eventListenerExists;
}

function addEventListener(eventType, callback) {
   if (isEventTypeValid(eventType)) {
      if (!isEventListeningActive(eventType)) {
         activeEventListeners.push({
            type: eventType,
            callbacks: [],
         });
      }

      const i = activeEventListeners.findIndex(x => x.type === eventType);
      activeEventListeners[i].callbacks.push(callback);

      console.log('| addEventListener: ' + eventType);
   }
}

function clearEventListeners(eventType, callback) {
   if (isEventTypeValid(eventType)) {
      if (isEventListeningActive(eventType)) {
         activeEventListeners.forEach(function (activeEvent, i) {
            if (eventType == activeEvent) {
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
