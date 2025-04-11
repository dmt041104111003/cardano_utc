import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import { getNFTInfo, getNFTInfoByPolicy, getNFTInfoByTx } from '../controllers/nftController.js';

const router = express.Router();

router.get('/info/:courseId', clerkMiddleware(), getNFTInfo);
router.get('/info/by-policy/:policyId/:txHash', clerkMiddleware(), getNFTInfoByPolicy);
router.get('/info/by-tx/:txHash', clerkMiddleware(), getNFTInfoByTx);

export default router;
