const {
   MessageAttachment,
   MessageEmbed,
   CommandInteraction,
} = require('discord.js');
const fetch = require('node-fetch');
const { log: l, table: t } = console;
const getNounInfo = require('../../../helpers/nouns/getNounInfo');
const createNounEmbed = require('../../../helpers/nouns/createNounEmbed');

module.exports = {
   subCommand: 'nerman.noun',
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await interaction.deferReply({ ephemeral: true });
      const Nouns = interaction.client.libraries.get('Nouns');
      // const nounRegex = /^\d{1,6}$/; // 1 to 6 digits. This may need to go higher as new ones are created daily.

      const nounNum = interaction.options.getInteger('int');

      if (nounNum < 0) {
         throw new Error('You must choose a Noun ID that is a positive integer.')
      }

      console.time('nounShit');
      const promises = [];
      // const nounInfo = getNounInfo(Nouns, nounNum);
      // const nounInfo = await getNounInfo(Nouns, nounNum);

      // l(nounInfo);

      //Opensea Link, Owner, previous auction info. Integrate Open Sea API

      // const resp = fetch(`https://noun.pics/${nounNum}.png`);

      promises.push(
         await getNounInfo(Nouns, nounNum),
         await fetch(`https://noun.pics/${nounNum}.png`)
      );
      // promises.push({nounInfo}, resp);
      // const resp = await fetch(`https://noun.pics/${nounNum}.png`);
      // console.timeEnd('nounShit');

      // l(resp);

      const [nounInfo, resp] = await Promise.all(promises);
      l('NOUN INFO HERE BABYYYYYYYY',{nounInfo});
      console.timeEnd('nounShit');

      if (!resp.ok) {
         throw new Error(
            `Unable to return Noun #${nounNum}, are you sure this Noun exists yet?`
         );
      }

      // disabled
      // const msgAttach = new MessageAttachment(
      //    `https://noun.pics/${nounNum}.png`
      // );

      const imgUrl = `https://noun.pics/${nounNum}.png`;

      // Getting Data for Noun 32
      //  Owner: 0x6f9e3976fa3b5b22761fe5D635E1f0d9d9aeB85d
      //  ENS found: skilift.eth
      //  Delegate: 0x6f9e3976fa3b5b22761fe5D635E1f0d9d9aeB85d
      //  ENS found: skilift.eth
      //  Voting Power:  1
      //  {
      // id: 32,
      // block: 13175772,
      // date: 2021-09-07T01:43:54.000Z,
      // amount: '150.69',
      // address: '0x6f9e3976fa3b5b22761fe5D635E1f0d9d9aeB85d',
      // ens: 'skilift.eth'
      //  }
      //  Noun 32 sold for 150.69 ETH to skilift.eth on 2021-09-06, 7:43:54 p.m.

      const nounEmbed = await createNounEmbed(nounInfo, imgUrl);

      console.log(nounEmbed);

      await interaction.editReply({
         // content: 'not empty?',
         embeds: [nounEmbed],
         ephermeral: true,
         // files: [msgAttach],
      });
      // interaction.editReply({
      //    // await interaction.editReply({
      //    content: `Noun ${nounNum}`,
      //    ephermeral: true,
      // });
   },
};
