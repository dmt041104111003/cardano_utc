import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import { getNFTInfo } from '../controllers/nftController.js';

const router = express.Router();

router.get('/info/:courseId', clerkMiddleware(), getNFTInfo);

export default router;
