import Verse, { IVerse } from '@/apiV1/verse/verse.model';
import { TRANSLATIONS } from '@/utilities/constants/bible.constants';
import '@/config/db';
import { IReference } from '@/types/utility/reference';
import { readTranslation } from './cleanData';

function buildId(verse: IVerse | IReference) {
  return `${verse.book}-${verse.chapter}-${verse.verse}`;
}

(async () => {
  try {
    for (const translation of TRANSLATIONS) {
      const verseMap = await readTranslation(translation);

      const existingVerses = (await Verse.find({ translation }).exec()).reduce(
        (map, v) => {
          map[buildId(v)] = v;
          return map;
        },
        {} as Record<string, IVerse>,
      );

      const verses = Object.values(verseMap);
      const versesToUpdate = verses.filter((v) => existingVerses[buildId(v)]?.text !== v.text);
      if (!versesToUpdate.length) {
        console.log(`nothing to update for ${translation}`);
        continue;
      }
      if (versesToUpdate.length < verses.length) {
        console.log(`filtered from ${verses.length} to ${versesToUpdate.length} verses`);
      }

      const versesToDrop = Object.values(versesToUpdate)
        .map((v) => existingVerses[buildId(v)])
        .filter((v) => !!v);
      await Verse.deleteMany({ _id: versesToDrop.map((v) => v._id) }).exec();
      console.log(`dropped ${versesToDrop.length} verses`);

      await Verse.insertMany(versesToUpdate);
      console.log(`inserted translation ${translation}`);
    }
    console.log('success');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(-1);
  }
})();
