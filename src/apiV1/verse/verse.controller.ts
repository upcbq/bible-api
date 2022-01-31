import { Request, Response } from 'express';
import httpStatus from 'http-status';
import Verse from './verse.model';
import { internalServerError, ServerError } from '@/helpers/errorHandler';
import { FetchVersesRequest } from '@/types/requests/verse/FetchVersesRequest';
import {
  FetchChapterRequestParam,
  FetchVerseRequestParam,
  TranslationQuery,
} from '@/types/requests/verse/FetchVerseRequest';
import { validateReference } from '@/middleware/validator';
import { referenceToString } from '@/utilities/utilityFunctions';
import { DEFAULT_TRANSLATION } from '@/utilities/constants/bible.constants';

export class VerseController {
  /**
   * Get a single verse
   */
  public async getVerse(req: Request<FetchVerseRequestParam, any, any, TranslationQuery>, res: Response) {
    try {
      const translation = req.query.translation || DEFAULT_TRANSLATION;

      const reference = {
        book: req.params.book,
        chapter: +req.params.chapter,
        verse: +req.params.verse,
        translation,
      };
      const validReference = validateReference(reference);

      if (!validReference) {
        throw new ServerError({
          message: `invalid reference ${referenceToString(reference)}`,
          status: httpStatus.NOT_FOUND,
        });
      }

      const verse = await Verse.findOne(reference).exec();
      if (!verse) {
        throw new ServerError({ message: 'verse not found', status: httpStatus.NOT_FOUND });
      }

      res.status(httpStatus.OK).send(verse);
    } catch (err) {
      internalServerError(err, req, res);
    }
  }
  /**
   * Get a single verse
   */
  public async getChapter(req: Request<FetchChapterRequestParam, any, any, TranslationQuery>, res: Response) {
    try {
      const translation = req.query.translation || DEFAULT_TRANSLATION;
      const reference = {
        book: req.params.book,
        chapter: +req.params.chapter,
        translation,
      };
      const validReference = validateReference(reference);

      if (!validReference) {
        throw new ServerError({
          message: `invalid reference ${referenceToString(reference)}`,
          status: httpStatus.NOT_FOUND,
        });
      }

      const verses = await Verse.find(reference).exec();
      if (!verses || !verses.length) {
        throw new ServerError({ message: 'verses not found', status: httpStatus.NOT_FOUND });
      }

      res.status(httpStatus.OK).send(verses);
    } catch (err) {
      internalServerError(err, req, res);
    }
  }

  /**
   * Get multiple verses at once
   */
  public async getVerses(req: Request<any, any, FetchVersesRequest, TranslationQuery>, res: Response) {
    try {
      const translation = req.query.translation || DEFAULT_TRANSLATION;
      if (req.body.verses.length > 1000) {
        throw new ServerError({
          message: `maximum verses at once is 1000`,
          status: httpStatus.REQUEST_ENTITY_TOO_LARGE,
        });
      }

      for (const reference of req.body.verses) {
        if (!validateReference(reference)) {
          throw new ServerError({
            message: `invalid reference ${referenceToString(reference)}`,
            status: httpStatus.NOT_FOUND,
          });
        }
      }

      const verses = await Verse.find({ $or: req.body.verses.map((v) => ({ translation, ...v })) }).exec();
      if (!verses) {
        throw new ServerError({ message: 'verses not found', status: httpStatus.NOT_FOUND });
      }

      res.status(httpStatus.OK).send(verses);
    } catch (err) {
      internalServerError(err, req, res);
    }
  }
}

const verseController = new VerseController();
export default verseController;
