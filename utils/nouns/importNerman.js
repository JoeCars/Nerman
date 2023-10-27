const DEFAULT_POLLING_TIME = 60_000;

module.exports = async function importNermanJS() {
   const _nerman = import('nerman');
   const nerman = await _nerman;
   return new nerman.Nouns(process.env.JSON_RPC_API_URL, {
      pollingTime: DEFAULT_POLLING_TIME,
   });
};
