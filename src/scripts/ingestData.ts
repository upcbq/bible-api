import Verse, { IVerse } from '@/apiV1/verse/verse.model';
import { BookShortNameMap, TRANSLATIONS } from '@/utilities/constants/bible.constants';
import fs from 'fs';
import '@/config/db';
import { referenceToString } from '@/utilities/utilityFunctions';
import { IReference } from '@/types/utility/reference';

function convertRef(ref: string): { book: string; chapter: number; verse: number } {
  try {
    // Parses short book name, chapter, and verse
    // Formatting expected like Gen.1:1
    const splitRef = ref.split(':');
    const splitBook = splitRef[0].split('.');
    const shortBook = splitBook[0];
    const chapter = splitBook[1];
    const verse = splitRef[1];
    if (!BookShortNameMap[shortBook]) {
      throw `no mapping found for ${shortBook}`;
    }
    return {
      book: BookShortNameMap[shortBook],
      chapter: +chapter,
      verse: +verse,
    };
  } catch (e) {
    console.error(e);
    process.exit(-1);
  }
}

function buildId(verse: IVerse | IReference) {
  return `${verse.book}-${verse.chapter}-${verse.verse}`;
}

(async () => {
  try {
    for (const translation of TRANSLATIONS) {
      const bibleFile = fs.readFileSync(`./data/bible-versions/${translation}.txt`, 'utf8').split('\n').filter(Boolean);

      const verseMap: Record<string, IVerse> = {};
      const existingVerses = (await Verse.find({ translation }).exec()).reduce((map, v) => {
        map[buildId(v)] = v;
        return map;
      }, {} as Record<string, IVerse>);

      let book = '';

      for (const line of bibleFile.slice(10)) {
        if (!line.includes(':')) {
          book = line
            .replace(/^I\s/, '1')
            .replace(/^II\s/, '2')
            .replace(/^III\s/, '3')
            .replace(/\s/g, '-')
            .toLowerCase();
          continue;
        }
        const firstSpace = line.indexOf(' ');
        const origRef = line.substring(0, firstSpace);
        const text = line.substring(firstSpace).trim();

        const ref = convertRef(origRef);

        if (!text) {
          console.log(`${referenceToString(ref)} excluded from translation ${translation}`);
          continue;
        }

        verseMap[buildId(ref)] = new Verse({
          ...ref,
          text,
          translation,
        });
      }

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
