/**
 * Calculates the difference between two dates.
 * @param {Date} date1
 * @param {Date} date2
 * @return {object} The result of adding num1 and num2.
 */

function timeDiffCalc(date1, date2) {
   let diff = Math.abs(date1 - date2) / 1000;

   //calc and subtract days
   const days = Math.floor(diff / 86400);
   diff -= days * 86400;

   //calc and subtract hours
   const hours = Math.floor(diff / 3600) % 24;
   diff -= hours * 3600;

   //calc and subtract minutes
   const minutes = Math.floor(diff / 60) % 60;
   diff -= minutes * 60;

   //calc seconds
   const seconds = Math.floor(diff);

   return { days: days, hours: hours, minutes: minutes, seconds: seconds };
}

/**
 * Formats a date to print nicely (usually for debugging)
 * @param {Date} date
 * @return {string} a console friendly formatted version of the date
 */
function formatDate(date) {
   var options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
   };
   return date.toLocaleDateString('en-US', options);
}

/**
 * Formats a date to print in a countdown format
 * @param {Date} date
 * @return {string} a formatted version of the date "hours:minutes:second"
 */
function formatDateCountdown(date) {
   const tDiff = timeDiffCalc(date, Date.now());

   const hours = tDiff.hours.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false,
   });
   const minutes = tDiff.minutes.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false,
   });
   const seconds = tDiff.seconds.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false,
   });

   return hours + ':' + minutes + ':' + seconds;
}

module.exports.timeDiffCalc = timeDiffCalc;

module.exports.formatDate = formatDate;

module.exports.formatDateCountdown = formatDateCountdown;
