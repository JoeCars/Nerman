module.exports = async client => {
   const {
      guilds: { cache: gCache },
   } = client;

   const muhBOI = await gCache
      .get(process.env.DISCORD_GUILD_ID)
      .members.cache.get(process.env.TIMESHEET_ID);

   const getTimeWithOffset = () => {
      let offset = 360 * 60 * 1000; // just a temp fix, nothing special
      return Date.parse(new Date()) - offset;
   };

   const generateTimeout = async () => {
      const oneHour = 60 * 60 * 1000;
      // let hourFromStart = new Date(todayStart);

      let currentTime = getTimeWithOffset();
      let todayStart = new Date();
      let todayEnd = new Date(todayStart);
      todayStart.setHours(10);
      todayStart.setMinutes(0);
      todayStart.setSeconds(0);
      todayEnd.setDate(todayStart.getDate() + 1);
      todayEnd.setHours(0);
      todayEnd.setMinutes(0);
      todayEnd.setSeconds(0);

      // disabled this is for dev
      // currentTime = currentTime.toLocaleString('en-US', {
      //    timezone: 'America/Edmonton',
      // });
      todayStart = todayStart.toLocaleString('en-US', {
         timezone: 'America/Edmonton',
      });
      todayEnd = todayEnd.toLocaleString('en-US', {
         timezone: 'America/Edmonton',
      });

      // hourFromStart = hourFromStart.toLocaleString('en-US', {
      //    timezone: 'America/Edmonton',
      // });

      // disabled this is for dev
      // const timeoutMs =
      //    Math.abs(Date.parse(todayStart) - Date.parse(currentTime)) %
      //    tenSeconds;
      const timeoutMs =
         Math.abs(Date.parse(todayStart) - currentTime) % oneHour;

      // return all in case I change this later
      // return { timeoutMs, todayStart, todayEnd };
      return timeoutMs;
   };

   const timeoutMs = await generateTimeout();

   setTimeout(() => {
      setInterval(() => {
         // disabled this is for dev
         // const nowTimezone = new Date().toLocaleString('en-US', {
         //    timezone: 'America/Edmonton',
         // });
         // const hour = new Date(nowTimezone).getHours();
         let nowTimezone = new Date(getTimeWithOffset());
         const hour = nowTimezone.getHours();
         const seconds = new Date(nowTimezone).getSeconds();

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
      }, 3600000);
   }, timeoutMs);
};

// 6 Nouns
// token,
