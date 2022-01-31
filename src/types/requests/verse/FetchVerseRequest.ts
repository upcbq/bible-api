import { ParamsDictionary, Query } from 'express-serve-static-core';

export interface FetchVerseRequestParam extends ParamsDictionary {
  book: string;
  chapter: string;
  verse: string;
}

export interface FetchChapterRequestParam extends ParamsDictionary {
  book: string;
  chapter: string;
}

export interface TranslationQuery extends Query {
  translation?: string;
}
