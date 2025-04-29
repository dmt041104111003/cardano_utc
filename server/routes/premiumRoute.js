import express from 'express';
import { paymentPremiumByAda, paymentPremiumByPaypal, paypalSuccess, paypalCancel } from '../controllers/premiumController.js';

const router = express.Router();

router.post('/payment-ada', paymentPremiumByAda);
router.post('/payment-paypal', paymentPremiumByPaypal);
router.get('/paypal-success', paypalSuccess);
router.get('/paypal-cancel', paypalCancel);

export default router; 