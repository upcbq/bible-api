import mongoose from 'mongoose';

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     Verse:
 *       type: object
 *       properties:
 *         book:
 *           type: string
 *         chapter:
 *           type: number
 *         verse:
 *           type: number
 *         text:
 *           type: string
 *     VerseRequest:
 *       type: object
 *       properties:
 *         book:
 *           type: string
 *         chapter:
 *           type: number
 *         verse:
 *           type: number
 */
export interface IVerse extends mongoose.Document {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface IVerseJson {
  book: string;
  chapter: number;
  verse: number;
  translation: string;
  text: string;
}

export const VerseSchema = new mongoose.Schema(
  {
    book: {
      type: String,
      required: true,
      trim: true,
    },
    chapter: {
      type: Number,
      required: true,
    },
    verse: {
      type: Number,
      required: true,
    },
    translation: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: false,
    useNestedStrict: true,
  },
);

VerseSchema.index({ book: 1, chapter: 1, verse: 1, translation: 1 }, { unique: true });
VerseSchema.index({ book: 1, chapter: 1, verse: 1 });
VerseSchema.index({ book: 1, chapter: 1 });

VerseSchema.set('toJSON', {
  transform(doc, ret, options) {
    delete ret.__v;
    delete ret._id;
  },
});

export default mongoose.model<IVerse>('Verse', VerseSchema);
