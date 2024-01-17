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
      if (isEmptyObject(context)) {
         context = '';
      }

      console.info(blue('[INFO]'), white(message), context);
   }

   static debug(message, context = {}) {
      if (isEmptyObject(context)) {
         context = '';
      }

      console.debug(green('[DEBUG]'), white(message), context);
   }

   static warn(message, context = {}) {
      if (isEmptyObject(context)) {
         context = '';
      }

      console.warn(yellow('[WARN]'), white(message), context);
   }

   static error(message, context = {}) {
      if (isEmptyObject(context)) {
         context = '';
      }

      console.error(red('[ERROR]'), white(message), context);
   }

   static fatal(message, context = {}) {
      if (isEmptyObject(context)) {
         context = '';
      }

      console.error(red('[FATAL]'), white(message), context);
   }
}

module.exports = Logger;
