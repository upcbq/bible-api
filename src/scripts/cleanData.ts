import fs from 'fs';
import { parseFile } from './bibleFormats';
import path from 'path';
import { IVerseJson } from '@/apiV1/verse/verse.model';
import { isEqual } from 'lodash';

function getFrequencyChart<T extends readonly any[]>(opts: T) {
  const freqChart: number[] & { length: T['length'] } = opts.map(() => 0);
  for (let i = 0; i < opts.length; i++) {
    let skip = false;
    for (let j = i + 1; j < opts.length; j++) {
      if (isEqual(opts[i], opts[j])) {
        freqChart[i]++;
        freqChart[j]++;
        skip = true;
        continue;
      }
      if (skip) {
        skip = false;
        continue;
      }
    }
  }

  return freqChart;
}

function getMostFrequentIndex(freqChart: number[]) {
  return Object.keys(freqChart).reduce<number>((maxIndex, index) => {
    if (freqChart[index] > freqChart[maxIndex]) {
      return +index;
    }
    return maxIndex;
  }, 0);
}

export const readTranslation = async (translation: string) => {
  try {
    const parseResults: Record<string, Record<string, IVerseJson>> = {};
    for (const file of fs.readdirSync(`./data/bible-versions/${translation}`)) {
      const filePath = path.resolve(path.join(`./data/bible-versions/${translation}`, file));
      const parseResult = parseFile(filePath, translation);
      if (parseResult) {
        parseResults[parseResult.format] = parseResult.verseMap;
      }
    }
    // If only one file, return file immediately
    if (Object.keys(parseResults).length === 1) {
      return Object.values(parseResults)[0];
    }

    // If multiple files, try to resolve to most common verse text
    const combined = Object.entries(parseResults).reduce<
      Record<string, Record<string, IVerseJson & { standard: string }>>
    >((obj, [source, pr]) => {
      Object.entries(pr).forEach(([key, value]) => {
        if (!obj[key]) obj[key] = {};
        obj[key][source] = {
          ...value,
          standard: value.text
            .replace(/[^a-zA-Z ]/g, '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' '),
        };
      });
      return obj;
    }, {});

    const final = Object.entries(combined).reduce<Record<string, IVerseJson>>((obj, [key, value]) => {
      const entries = Object.entries(value);
      const verses = entries.map((e) => e[1]);

      if (verses.length === 1) {
        const { standard: _standard, ...verse } = verses[0];
        obj[key] = verse;
        return obj;
      }

      const freqChart = getFrequencyChart(verses.map((v) => v.standard));
      const mostFrequentTextIndex = getMostFrequentIndex(freqChart);

      const { standard: _standard, ...verse } = verses[mostFrequentTextIndex];
      obj[key] = verse;
      return obj;
    }, {});

    return final;
  } catch (e) {
    console.error(e);
    process.exit(-1);
  }
};
