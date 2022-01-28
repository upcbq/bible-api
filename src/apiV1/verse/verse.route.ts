import { validateRequestBody } from '@/middleware/validator';
import { FetchVersesRequest } from '@/types/requests/verse/FetchVersesRequest';
import { Router } from 'express';
import controller from './verse.controller';

export const verseRouter: Router = Router();

/**
 * @swagger
 *
 * /v1/verse/{book}/{chapter}/{verse}:
 *   get:
 *     tags:
 *       - Verse
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: book
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: chapter
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: verse
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Verse'
 *
 * /v1/verse:
 *   post:
 *     tags:
 *       - Verse
 *     produces:
 *       - application/json
 *     requestBody:
 *       $ref: '#/components/requestBodies/FetchVersesBody'
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Verse'
 */

// Get one verse
verseRouter.get('/:book/:chapter/:verse', controller.getVerse);
// Get multiple verses
verseRouter.post('', validateRequestBody(FetchVersesRequest), controller.getVerses);
