import { Request, Response } from 'express';
import httpStatus from 'http-status';
import Verse from './verse.model';
import { internalServerError, ServerError } from '@/helpers/errorHandler';
import { FetchVersesRequest } from '@/types/requests/verse/FetchVersesRequest';
import { FetchVerseRequestParam } from '@/types/requests/verse/FetchVerseRequest';
import { validateReference } from '@/middleware/validator';
import { referenceToString } from '@/utilities/utilityFunctions';

export class VerseController {
  /**
   * Get a single verse
   */
  public async getVerse(req: Request<FetchVerseRequestParam>, res: Response) {
    try {
      const reference = {
        book: req.params.book,
        chapter: +req.params.chapter,
        verse: +req.params.verse,
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
   * Get multiple verses at once
   */
  public async getVerses(req: Request<any, any, FetchVersesRequest>, res: Response) {
    try {
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

      const verses = await Verse.find({ $or: req.body.verses }).exec();
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
