import { Router } from 'express';
import { verseRouter } from './verse/verse.route';

const router: Router = Router();

router.use('/verse', verseRouter);

export default router;
