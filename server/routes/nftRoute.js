import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import { getNFTInfo, getNFTInfoByPolicy } from '../controllers/nftController.js';

const router = express.Router();

router.get('/info/:courseId', clerkMiddleware(), getNFTInfo);
router.get('/info/by-policy/:policyId/:txHash', clerkMiddleware(), getNFTInfoByPolicy);

export default router;
