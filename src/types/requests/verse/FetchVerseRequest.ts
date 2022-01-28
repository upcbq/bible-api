import { ParamsDictionary } from 'express-serve-static-core';

export interface FetchVerseRequestParam extends ParamsDictionary {
  book: string;
  chapter: string;
  verse: string;
}
