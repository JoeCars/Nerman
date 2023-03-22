module.exports = async () => {
   const importSON = async () => {
      const _nerman = import('stateofnouns');
      const nerman = await _nerman;
      return new nerman.Nouns(process.env.JSON_RPC_API_URL);
   };

   return await importSON();
};
