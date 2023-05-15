class Logger {
   static info(message, context) {
      let date = new Date().toISOString();
      console.info(`[${date}] [INFO] ${message} ${context}`);
   }

   static debug(message, context) {
      let date = new Date().toISOString();
      console.debug(`[${date}] [DEBUG] ${message} ${context}`);
   }

   static warn(message, context) {
      let date = new Date().toISOString();
      console.warn(`[${date}] [WARN] ${message} ${context}`);
   }

   static error(message, context) {
      let date = new Date().toISOString();
      console.error(`[${date}] [ERROR] ${message} ${context}`);
   }

   static fatal(message, context) {
      let date = new Date().toISOString();
      console.error(`[${date}] [FATAL] ${message} ${context}`);
   }
}

module.exports = Logger;
