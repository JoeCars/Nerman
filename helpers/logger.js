// Reference for Unicode escape colours.
// black = "\x1b[30m"
// red = "\x1b[31m"
// green = "\x1b[32m"
// yellow = "\x1b[33m"
// blue = "\x1b[34m"
// magenta = "\x1b[35m"
// cyan = "\x1b[36m"
// white = "\x1b[37m"
function black(string) {
   return `\x1b[30m${string}\x1b[0m`;
}

function red(string) {
   return `\x1b[31m${string}\x1b[0m`;
}

function green(string) {
   return `\x1b[32m${string}\x1b[0m`;
}

function yellow(string) {
   return `\x1b[33m${string}\x1b[0m`;
}

function blue(string) {
   return `\x1b[34m${string}\x1b[0m`;
}

function magenta(string) {
   return `\x1b[35m${string}\x1b[0m`;
}

function cyan(string) {
   return `\x1b[36m${string}\x1b[0m`;
}

function white(string) {
   return `\x1b[37m${string}\x1b[0m`;
}

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
      return green(JSON.stringify(context));
   } catch (error) {
      return 'Unable to stringify context due to an error. ' + error.message;
   }
}

function stringifyDate() {
   return cyan(`[${new Date().toISOString()}]`);
}

class Logger {
   static info(message, context = {}) {
      let date = stringifyDate();
      let contextString = stringifyContext(context);

      console.info(`${date} ${blue('[INFO]')} ${message} ${contextString}`);
   }

   static debug(message, context = {}) {
      let date = stringifyDate();
      let contextString = stringifyContext(context);

      console.debug(`${date} ${green('[DEBUG]')} ${message} ${contextString}`);
   }

   static warn(message, context = {}) {
      let date = stringifyDate();
      let contextString = stringifyContext(context);

      console.warn(`${date} ${yellow('[WARN]')} ${message} ${contextString}`);

      checkForErrors(context);
   }

   static error(message, context = {}) {
      let date = stringifyDate();
      let contextString = stringifyContext(context);

      console.error(`${date} ${red('[ERROR]')} ${message} ${contextString}`);

      checkForErrors(context);
   }

   static fatal(message, context = {}) {
      let date = stringifyDate();
      let contextString = stringifyContext(context);

      console.error(`${date} ${red('[FATAL]')} ${message} ${contextString}`);

      checkForErrors(context);
   }
}

module.exports = Logger;
