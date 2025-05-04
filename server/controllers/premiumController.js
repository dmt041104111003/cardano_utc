import { sendAda } from "../utils/BlockchainUtils.js";
import paypal from 'paypal-rest-sdk';
import User from "../models/User.js";
import PremiumTransaction from "../models/PremiumTransaction.js";

// Configure PayPal
paypal.configure({
    mode: 'sandbox',
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET
});

// Debug log for PayPal environment variables
console.log('PAYPAL ENV:', {
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET
});

const PREMIUM_ADA_ADDRESS = 'addr_test1qqcc0nggvw9ctfvjwj3ksssvufflhmwymh7uaw8cnjlfxj4gw7ql85e7m6yzdn2ssncqdpf7xfm96k386vdc5xp5g75q7uhvay';
const PREMIUM_PAYPAL_EMAIL = 'sb-huutl40684105@business.example.com';

export const paymentPremiumByAda = async (req, res) => {
    const { utxos, changeAddress, value, userId, plan } = req.body;
    try {
        const unsignedTx = await sendAda(utxos, changeAddress, PREMIUM_ADA_ADDRESS, value);
        if (!unsignedTx) {
            return res.status(500).json({ success: false, message: "Error creating transaction" });
        }
        await PremiumTransaction.create({
            user: userId,
            amount: value / 1e6,
            currency: "ADA",
            paymentMethod: "ADA",
            plan,
            status: "pending",
            note: `Premium plan: ${plan}`,
        });
        // Update user's premium status immediately for demo (if needed)
        const user = await User.findById(userId);
        if (user) {
            user.premiumPlan = plan;
            if (plan === 'yearly') {
                user.premiumExpiry = new Date(Date.now() + 5 * 60 * 60 * 1000); // 5 hours
            } else {
                user.premiumExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
            }
            await user.save();
        }
        res.json({ success: true, unsignedTx });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const paymentPremiumByPaypal = async (req, res) => {
    const { userId, plan, usdPrice } = req.body;
    
    try {
        // Ensure price is a string
        const priceStr = usdPrice.toString();
        
        const payment = {
            intent: "sale",
            payer: { payment_method: "paypal" },
            redirect_urls: {
                return_url: `${req.protocol}://${req.get('host')}/api/premium/paypal-success?userId=${userId}&plan=${plan}`,
                cancel_url: `${req.protocol}://${req.get('host')}/api/premium/paypal-cancel`
            },
            transactions: [{
                payee: { email: PREMIUM_PAYPAL_EMAIL },
                item_list: {
                    items: [{
                        name: `Premium Plan: ${plan}`,
                        sku: `PREMIUM-${plan}`,
                        price: priceStr,
                        currency: 'USD',
                        quantity: 1
                    }]
                },
                amount: {
                    currency: 'USD',
                    total: priceStr
                },
                description: `Premium plan subscription: ${plan}`,
                invoice_number: `PREMIUM-${Date.now()}`
            }]
        };

        // Debug log for payment body
        console.log('Premium PayPal payment body:', payment);

        paypal.payment.create(payment, async (error, payment) => {
            if (error) {
                console.error('PayPal payment creation error:', error);
                return res.status(500).json({ success: false, message: error.message });
            }
            
            try {
                await PremiumTransaction.create({
                    user: userId,
                    amount: usdPrice,
                    currency: "USD",
                    paymentMethod: "PayPal",
                    plan,
                    status: "pending",
                    note: `Premium plan: ${plan}`,
                });
                
                const forwardLink = payment.links.find(link => link.rel === "approval_url").href;
                res.json({ success: true, forwardLink });
            } catch (dbError) {
                console.error('Database error:', dbError);
                res.status(500).json({ success: false, message: dbError.message });
            }
        });
    } catch (error) {
        console.error('Premium PayPal payment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const paypalSuccess = async (req, res) => {
    const { PayerID: payerId, paymentId, userId, plan } = req.query;

    try {
        // Execute the payment
        const payment = await new Promise((resolve, reject) => {
            paypal.payment.execute(paymentId, { payer_id: payerId }, (error, payment) => {
                if (error) reject(error);
                else resolve(payment);
            });
        });

        if (payment.state !== 'approved') {
            throw new Error('Payment not approved');
        }

        // Update premium transaction status
        const transaction = await PremiumTransaction.findOneAndUpdate(
            { user: userId, plan, status: 'pending' },
            { 
                status: 'completed',
                note: `Premium plan: ${plan} - Payment completed`
            },
            { new: true }
        );

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        // Update user's premium status
        const user = await User.findById(userId);
        if (user) {
            user.premiumPlan = plan;
            if (plan === 'yearly') {
                user.premiumExpiry = new Date(Date.now() + 5 * 60 * 60 * 1000); // 5 hours
            } else {
                user.premiumExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
            }
            await user.save();
        }

        const origin = req.get('origin') || 'https://client-react-brown.vercel.app';
        res.redirect(`${origin}/educator/subscription?status=success&message=Payment successful! Your premium plan has been activated.`);
    } catch (error) {
        console.error('Premium PayPal success error:', error);
        const origin = req.get('origin') || 'https://client-react-brown.vercel.app';
        res.redirect(`${origin}/educator/subscription?status=error&message=${encodeURIComponent(error.message)}`);
    }
};

export const paypalCancel = async (req, res) => {
    const origin = req.get('origin') || 'https://client-react-brown.vercel.app';
    res.redirect(`${origin}/educator/subscription?status=cancelled&message=Payment was cancelled.`);
}; 