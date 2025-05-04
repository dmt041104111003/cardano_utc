import express from 'express';
import { verifyPurchaseAddress } from '../controllers/purchaseController.js';
import { clerkMiddleware } from '@clerk/express';

const router = express.Router();

// Kiểm tra địa chỉ ví đã dùng để mua khóa học
router.get('/verify-purchase-address/:courseId', clerkMiddleware(), verifyPurchaseAddress);

export default router;
