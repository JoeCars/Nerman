function isEmptyObject(object) {
   return Object.keys(object).length === 0;
}

function checkForErrors(context) {
   if (context.error) {
      console.error(context.error);
   } else if (context.err) {
      console.error(context.err);
   }
}

function stringifyContext(context) {
   if (!context || isEmptyObject(context)) {
      return '';
   }

   try {
      return JSON.stringify(context);
   } catch (error) {
      return 'Unable to stringify context due to an error. ' + error.message;
   }
}

class Logger {
   static info(message, context = {}) {
      let date = new Date().toISOString();
      let contextString = stringifyContext(context);

      console.info(`[${date}] [INFO] ${message} ${contextString}`);
   }

   static debug(message, context = {}) {
      let date = new Date().toISOString();
      let contextString = stringifyContext(context);

      console.debug(`[${date}] [DEBUG] ${message} ${contextString}`);
   }

   static warn(message, context = {}) {
      let date = new Date().toISOString();
      let contextString = stringifyContext(context);

      console.warn(`[${date}] [WARN] ${message} ${contextString}`);

      checkForErrors(context);
   }

   static error(message, context = {}) {
      let date = new Date().toISOString();
      let contextString = stringifyContext(context);

      console.error(`[${date}] [ERROR] ${message} ${contextString}`);

      checkForErrors(context);
   }

   static fatal(message, context = {}) {
      let date = new Date().toISOString();
      let contextString = stringifyContext(context);

      console.error(`[${date}] [FATAL] ${message} ${contextString}`);

      checkForErrors(context);
   }
}

module.exports = Logger;
