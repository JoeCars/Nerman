const { log: l } = console;

module.exports = async client => {
   const {
      guilds: { cache: gCache },
   } = client;

   const muhBOI = await gCache
      .get(process.env.DISCORD_GUILD_ID)
      .members.cache.get(process.env.TIMESHEET_ID);

   const generateTimeout = async () => {
      const tenSeconds = 10 * 1000;
      const oneHour = 60 * 60 * 1000;
      // l({ currentTime });
      // let hourFromStart = new Date(todayStart);
      let currentTime = new Date();
      let todayStart = new Date();
      let todayEnd = new Date(todayStart);
      todayStart.setHours(10);
      todayStart.setMinutes(0);
      todayStart.setSeconds(0);
      // hourFromStart.setHours(11);
      // hourFromStart.setMinutes(0);
      // hourFromStart.setSeconds(0);
      todayEnd.setDate(todayStart.getDate() + 1);
      todayEnd.setHours(0);
      todayEnd.setMinutes(0);
      todayEnd.setSeconds(0);

      currentTime = currentTime.toLocaleString('en-US', {
         timezone: 'America/Edmonton',
      });
      todayStart = todayStart.toLocaleString('en-US', {
         timezone: 'America/Edmonton',
      });
      todayEnd = todayEnd.toLocaleString('en-US', {
         timezone: 'America/Edmonton',
      });
      // hourFromStart = hourFromStart.toLocaleString('en-US', {
      //    timezone: 'America/Edmonton',
      // });

      const timeoutMs =
         Math.abs(Date.parse(todayStart) - Date.parse(currentTime)) % tenSeconds;

      l({ timeoutMs });
      // return all in case I change this later
      // return { timeoutMs, todayStart, todayEnd };
      return timeoutMs;
   };

   const timeoutMs = await generateTimeout();

   setTimeout(() => {
      setInterval(() => {
         const nowTimezone = new Date().toLocaleString('en-US', {
            timezone: 'America/Edmonton',
         });
         l({ nowTimezone });
         const hour = new Date(nowTimezone).getHours();
         l({ hour });
         const seconds = new Date(nowTimezone).getSeconds();

         l({ seconds });
         switch (true) {
            case hour > 10:
               muhBOI.send({
                  content: `It's me, ya boi. Reminding you to log what you have done the past hour.`,
               });
               break;
            case hour === 0:
               muhBOI.send({
                  content: `It's me, ya boi. Reminding you to log what you have done the past hour.`,
               });
               break;
            default:
               break;
         }
      }, 3000);
   }, timeoutMs);
};
