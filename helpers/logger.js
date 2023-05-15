class Logger {
   static info(message, context) {
      let date = new Date().toISOString();
      console.info(`[${date}] [INFO] ${message} ${JSON.stringify(context)}`);
   }

   static debug(message, context) {
      let date = new Date().toISOString();
      console.debug(`[${date}] [DEBUG] ${message} ${JSON.stringify(context)}`);
   }

   static warn(message, context) {
      let date = new Date().toISOString();
      console.warn(`[${date}] [WARN] ${message} ${JSON.stringify(context)}`);
   }

   static error(message, context) {
      let date = new Date().toISOString();
      console.error(`[${date}] [ERROR] ${message} ${JSON.stringify(context)}`);
   }

   static fatal(message, context) {
      let date = new Date().toISOString();
      console.error(`[${date}] [FATAL] ${message} ${JSON.stringify(context)}`);
   }
}

module.exports = Logger;
