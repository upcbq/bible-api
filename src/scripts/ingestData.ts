import Verse, { IVerse } from '@/apiV1/verse/verse.model';
import { BookShortNameMap } from '@/utilities/constants/bible.constants';
import fs from 'fs';
import '@/config/db';

function convertRef(ref: string): { book: string; chapter: number; verse: number } {
  try {
    const splitRef = ref.split(':');
    const shortBook = splitRef[0].replace(/\d+$/, '');
    const chapter = splitRef[0].match(/(\d+$)/)[1];
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

(async () => {
  const bibleFile = fs.readFileSync('./data/bible-versions/kjv.txt', 'utf8').split('\n').filter(Boolean);

  const verses: Array<IVerse> = [];

  for (const line of bibleFile) {
    const firstSpace = line.indexOf(' ');
    const origRef = line.substring(0, firstSpace);
    const text = line.substring(firstSpace).trim();

    const ref = convertRef(origRef);

    verses.push(
      new Verse({
        ...ref,
        text,
      }),
    );
  }
  await Verse.insertMany(verses);
  console.log(JSON.stringify({ verses }, null, 2));
})();
