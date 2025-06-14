import { IVerse, IVerseJson } from '@/apiV1/verse/verse.model';
import { IReference } from '@/types/utility/reference';
import { Book, BookShortNameMap, ORDERED_BOOKS } from '@/utilities/constants/bible.constants';
import { referenceToString } from '@/utilities/utilityFunctions';
import fs from 'fs';
import path from 'path';

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

export const formats = [
  {
    name: 'bible4u',
    matcher: /.*?\.bible4u.txt/,
    parser: (bibleFile: string[], translation: string) => {
      const verseMap: Record<string, IVerseJson> = {};

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
        const text = line
          .substring(firstSpace)
          .trim()
          .replace(/\s{2,}/g, ' ');

        const ref = convertRef(origRef);

        if (!text) {
          console.log(`${referenceToString(ref)} excluded from translation ${translation}`);
          continue;
        }

        verseMap[buildId(ref)] = {
          ...ref,
          text,
          translation,
        };
      }

      return verseMap;
    },
  },
  {
    name: 'bibleprotector',
    matcher: /.*?\.bibleprotector.txt/,
    parser: (bibleFile: string[], translation: string) => {
      const verseMap: Record<string, IVerseJson> = {};

      const BP_BOOK_MAP = {
        Genesis: 'genesis',
        Exodus: 'exodus',
        Leviticus: 'leviticus',
        Numbers: 'numbers',
        Deuteronomy: 'deuteronomy',
        Joshua: 'joshua',
        Judges: 'judges',
        Ruth: 'ruth',
        '1 Samuel': '1-samuel',
        '2 Samuel': '2-samuel',
        '1 Kings': '1-kings',
        '2 Kings': '2-kings',
        '1 Chronicles': '1-chronicles',
        '2 Chronicles': '2-chronicles',
        Ezra: 'ezra',
        Nehemiah: 'nehemiah',
        Esther: 'esther',
        Job: 'job',
        Psalm: 'psalm',
        Proverbs: 'proverbs',
        Ecclesiastes: 'ecclesiastes',
        'Song of Solomon': 'song-of-solomon',
        Isaiah: 'isaiah',
        Jeremiah: 'jeremiah',
        Lamentations: 'lamentations',
        Ezekiel: 'ezekiel',
        Daniel: 'daniel',
        Hosea: 'hosea',
        Joel: 'joel',
        Amos: 'amos',
        Obadiah: 'obadiah',
        Jonah: 'jonah',
        Micah: 'micah',
        Nahum: 'nahum',
        Habakkuk: 'habakkuk',
        Zephaniah: 'zephaniah',
        Haggai: 'haggai',
        Zechariah: 'zechariah',
        Malachi: 'malachi',
        Matthew: 'matthew',
        Mark: 'mark',
        Luke: 'luke',
        John: 'john',
        Acts: 'acts',
        Romans: 'romans',
        '1 Corinthians': '1-corinthians',
        '2 Corinthians': '2-corinthians',
        Galatians: 'galatians',
        Ephesians: 'ephesians',
        Philippians: 'philippians',
        Colossians: 'colossians',
        '1 Thessalonians': '1-thessalonians',
        '2 Thessalonians': '2-thessalonians',
        '1 Timothy': '1-timothy',
        '2 Timothy': '2-timothy',
        Titus: 'titus',
        Philemon: 'philemon',
        Hebrews: 'hebrews',
        James: 'james',
        '1 Peter': '1-peter',
        '2 Peter': '2-peter',
        '1 John': '1-john',
        '2 John': '2-john',
        '3 John': '3-john',
        Jude: 'jude',
        Revelation: 'revelation',
      } as const satisfies Record<string, Book>;

      for (const line of bibleFile.slice(2)) {
        const results = /(.*?)	(.*?$)/.exec(line);
        if (results) {
          const refString = results[1];
          const verseText = results[2];

          const refResult = /(.+?)(\d+?):(\d+?)$/.exec(refString);
          if (refResult) {
            const book = refResult[1].trim();
            const chapter = refResult[2];
            const verse = refResult[3];

            const ref: { book: string; chapter: number; verse: number } = {
              book: BP_BOOK_MAP[book],
              chapter: +chapter,
              verse: +verse,
            };

            const text = verseText.trim().replace(/\s{2,}/g, ' ');

            if (!text) {
              console.log(`${referenceToString(ref)} excluded from translation ${translation}`);
              continue;
            }

            verseMap[buildId(ref)] = {
              ...ref,
              text,
              translation,
            };
          }
        }
      }
      return verseMap;
    },
  },
  {
    name: 'gutenberg',
    matcher: /.*?\.gutenberg.txt/,
    parser: (bibleFile: string[], translation: string) => {
      const verseMap: Record<string, IVerseJson> = {};

      const bookMap = [...bibleFile.slice(21, 60), ...bibleFile.slice(62, 89)]
        .map((b) => b.trim())
        .reduce<Record<string, string>>((obj, b, i) => {
          obj[b] = ORDERED_BOOKS[i];
          return obj;
        }, {});

      function splitAllRefs(line: string) {
        const lines: string[] = [];
        const result = /(\d+?):(\d+?)(?:(\s+)(.*?)|$)$/.exec(line);
        if (result) {
          const extraRef = /\d+?:\d+/.exec(result[4]);
          if (extraRef) {
            const lineStartIndex = extraRef.index + result[1].length + result[2].length + result[3].length;
            lines.push(line.substring(0, lineStartIndex).trim());
            if (line.length > lineStartIndex) {
              lines.push(...splitAllRefs(line.substring(lineStartIndex).trim()));
            }
          } else {
            lines.push(line);
          }
        }
        return lines;
      }

      const fixedBible: string[] = [];
      for (const line of bibleFile
        .slice(95)
        .map((v) => v.trim())
        .filter(Boolean)) {
        if (line.includes('*** END OF THE PROJECT GUTENBERG EBOOK THE KING JAMES VERSION OF THE BIBLE ***')) {
          break;
        }
        if (!line.trim()) {
          continue;
        }
        const result = /(\d+?):(\d+)/.exec(line);
        if (result) {
          if (result.index !== 0) {
            fixedBible[fixedBible.length - 1] += ' ' + line.substring(0, result.index).trim();
          }
          fixedBible.push(...splitAllRefs(line.substring(result.index)));
        } else {
          if (bookMap[line]) {
            fixedBible.push(line);
          } else {
            fixedBible[fixedBible.length - 1] += ' ' + line.trim();
          }
        }
      }

      let book = '';
      for (const line of fixedBible) {
        if (bookMap[line]) {
          book = bookMap[line];
          continue;
        }
        const result = /(\d+?):(\d+?)\s+(.*?)$/.exec(line);
        if (result) {
          const chapter = result[1];
          const verse = result[2];

          const ref: { book: string; chapter: number; verse: number } = {
            book,
            chapter: +chapter,
            verse: +verse,
          };

          const text = result[3].trim().replace(/\s{2,}/g, ' ');

          if (!text) {
            console.log(`${referenceToString(ref)} excluded from translation ${translation}`);
            continue;
          }

          verseMap[buildId(ref)] = {
            ...ref,
            text,
            translation,
          };
        }
      }
      return verseMap;
    },
  },
];

export function parseFile(filePath: string, translation: string) {
  const fileName = `${path.basename(filePath)}.${path.extname(filePath)}`;
  for (const format of formats) {
    if (format.matcher.test(fileName)) {
      return {
        format: format.name,
        verseMap: format.parser(fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean), translation),
      };
    }
  }
}
