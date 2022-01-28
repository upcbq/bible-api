import { GenericRequest } from '@/types/requests/GenericRequest';
import { IsArray, IsDefined, IsInt, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export interface IFetchVersionsRequest {
  verses: IFetchVersesVerseRequest[];
}

export interface IFetchVersesVerseRequest {
  book: string;
  chapter: number;
  verse: number;
}
/**
 * @swagger
 *
 * components:
 *   requestBodies:
 *     FetchVersesBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     book:
 *                       type: string
 *                     chapter:
 *                       type: number
 *                     verse:
 *                       type: number
 */
export class FetchVersesRequest extends GenericRequest<FetchVersesRequest> {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested()
  public verses: FetchVersesVerseRequest[];

  constructor(obj: IFetchVersionsRequest) {
    super(obj);

    this.verses = obj.verses.map((verse) => new FetchVersesVerseRequest(verse));
  }
}

class FetchVersesVerseRequest extends GenericRequest<FetchVersesVerseRequest> {
  @IsString()
  @IsNotEmpty()
  public book: string;

  @IsInt()
  @IsDefined()
  public chapter: number;

  @IsInt()
  @IsDefined()
  public verse: number;
}
