import { IReference } from '@/types/utility/reference';
import { ChapterVerseCount } from '@/utilities/constants/bible.constants';
import { validate, ValidatorOptions } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import merge from 'lodash/merge';

const validatorOptions: ValidatorOptions = {
  skipMissingProperties: true,
  whitelist: true,
  validationError: {
    value: true,
    target: false,
  },
};

/**
 * Express middleware function that validates that the body of request object matches the provided class. We
 * utilize the plugin `class-validator` to perform the validation based on property annotations that are present
 * on the class.
 *
 * @param requestBodyClass
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function validateRequestBody<T extends object>(requestBodyClass: new (...args: any[]) => T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const request = new requestBodyClass(req.body);
    const errors = await validate(request, validatorOptions);
    if (errors.length > 0) {
      res
        .status(httpStatus.BAD_REQUEST)
        .json({
          errors: merge(
            {},
            ...errors.map(function mapErrors(err) {
              return {
                [err.property]: {
                  ...err,
                  children:
                    (err.children &&
                      err.children.length > 0 &&
                      merge({}, ...err.children.map((childErr) => mapErrors(childErr)))) ||
                    undefined,
                  property: undefined,
                },
              };
            }),
          ),
        })
        .send();
    } else {
      req.body = request;
      next();
    }
  };
}

export function validateReference(ref: Partial<IReference>): boolean {
  if ((ref.verse && (!ref.chapter || !ref.book)) || (ref.chapter && !ref.book)) {
    return false;
  }
  if (ref.book && !ChapterVerseCount[ref.book]) {
    return false;
  }
  if (ref.book && ref.chapter && ChapterVerseCount[ref.book][ref.chapter] === undefined) {
    return false;
  }
  if (
    ref.book &&
    ref.chapter &&
    ref.verse &&
    (ChapterVerseCount[ref.book][ref.chapter] < ref.verse || ref.verse <= 0)
  ) {
    return false;
  }
  return true;
}
