import {sendAda} from "../utils/BlockchainUtils.js";
import paypal from 'paypal-rest-sdk';
import dotenv from 'dotenv';
import Course from "../models/Course.js";
import Stripe from 'stripe';
import User from "../models/User.js";
import { Purchase } from "../models/Purchase.js";


export const paymentByAda = async (req, res) => {
    const { utxos, changeAddress, getAddress, value, courseId, userId } = req.body;

    try {
        // Check if user already owns the course
        const user = await User.findById(userId);
        if (user && user.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ success: false, message: 'You already own this course.' });
        }
        const unsignedTx = await sendAda(utxos, changeAddress, getAddress, value);
        if (!unsignedTx) {
            return res.status(500).json({ success: false, message: "Loi thanh toan" });
        }
        res.json({ success: true, unsignedTx });
    } catch (error) {
        console.error("Lỗi thanh toan:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


paypal.configure({
    mode:'sandbox',
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET
  });
  
  // Debug log for PayPal environment variables
  console.log('PAYPAL ENV:', {
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
    business_email: process.env.PAYPAL_BUSINESS_EMAIL
  });
  
  export const paymentByPaypal = async (req, res) => {
    const { courseName, courseId, price, userId } = req.body;
  
  
    try {
    
      const course = await Course.findById(courseId);
      const user = await User.findById(userId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (user.enrolledCourses.includes(courseId)) {
        return res.status(400).json({ success: false, message: 'You already own this course.' });
      }
      // Lấy educator và paypalEmail
      const educator = await User.findById(course.educator);
      if (!educator || !educator.paypalEmail) {
        return res.status(400).json({ success: false, message: 'Educator PayPal email is missing.' });
      }
      const receiverPaypalEmail = educator.paypalEmail;
  
      // Ensure price is a string
      const priceStr = price.toString();
  
      const create_payment_json = {
        intent: 'sale',
        payer: { payment_method: 'paypal' },
        redirect_urls: {
          return_url: `${req.protocol}://${req.get('host')}/api/course/paypal-success?courseId=${courseId}&userId=${userId}`,
          cancel_url: `${req.protocol}://${req.get('host')}/api/course/paypal-cancel`
        },
        transactions: [{
          payee: { email: receiverPaypalEmail },
          item_list: {
            items: [{
              name: courseName,
              sku: courseId,
              price: priceStr,
              currency: 'USD',
              quantity: 1
            }]
          },
          amount: {
            currency: 'USD',
            total: priceStr
          },
          description: `Payment for course: ${courseName}`,
          invoice_number: `INV-${Date.now()}` 
        }]
      };
  
   
      // Debug log for payment body
      console.log('PayPal payment body:', create_payment_json);
  
      const payment = await new Promise((resolve, reject) => {
        paypal.payment.create(create_payment_json, (error, payment) => {
          if (error) {
            console.error('PayPal payment creation error:', error);
            reject(error);
          } else {
            console.log('PayPal payment created successfully:', payment.id);
            resolve(payment);
          }
        });
      });
  
      const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
      if (!approvalUrl) {
        throw new Error('No PayPal approval URL found');
      }
  
      res.json({ 
        success: true,
        forwardLink: approvalUrl.href,
        paymentId: payment.id 
      });
  
    } catch (error) {
      console.error('PayPal payment creation error:', error);
      res.status(500).json({ 
        success: false,
        error: error.response?.message || error.message || 'Failed to create PayPal payment',
        details: process.env.NODE_ENV === 'development' ? error.response : undefined
      });
    }
  };
  

export const paypalSuccess = async (req, res) => {
    const { PayerID: payerId, paymentId, courseId, userId } = req.query;

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

        // Lấy course trước khi dùng
        const course = await Course.findById(courseId);
        const educator = course ? await User.findById(course.educator) : null;

        // Create purchase record
        const purchase = await Purchase.create({
            courseId,
            userId,
            amount: payment.transactions[0].amount.total,
            currency: 'USD',
            status: 'completed',
            paymentMethod: 'PayPal',
            receiverAddress: educator && educator.paypalEmail ? educator.paypalEmail : '',
            note: 'Payment successful',
            createdAt: new Date()
        });

        // Update user's enrolled courses
        const user = await User.findById(userId);

        if (user && course) {
            user.enrolledCourses.push(courseId);
            course.enrolledStudents.push(userId);
            await user.save();
            await course.save();
        }

        const origin = req.get('origin') || 'http://localhost:5173';
        res.redirect(`${origin}/my-enrollments?status=success&message=Payment successful! You are now enrolled in the course.`);
    } catch (error) {
        console.error('PayPal success error:', error);
        const origin = req.get('origin') || 'http://localhost:5173';
        res.redirect(`${origin}/my-enrollments?status=error&message=${encodeURIComponent(error.message)}`);
    }
};

export const paypalCancel = async (req, res) => {
    const origin = req.get('origin') || 'http://localhost:5173';
    res.redirect(`${origin}/my-enrollments?status=cancelled&message=Payment was cancelled.`);
};


  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
 
  export const paymentByStripe = async (req, res) => {
    const { courseName, courseId, price, userId } = req.body;
  
    try {
        const course = await Course.findById(courseId);
        const user = await User.findById(userId);
        if (!course || !user) {
            return res.status(404).json({ success: false, message: 'Course or User not found' });
        }
        if (user.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ success: false, message: 'You already own this course.' });
        }

        const purchase = await Purchase.create({
            courseId,
            userId,
            amount: price,
            currency: 'USD',
            status: 'pending',
            paymentMethod: 'Stripe payment',
            receiverAddress: process.env.PAYPAL_BUSINESS_EMAIL,
            note: 'Đang chờ thanh toán',
            createdAt: new Date(),
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${req.get('origin') || 'http://localhost:5173'}/my-enrollments?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.get('origin') || 'http://localhost:5173'}/courses`,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: courseName,  
                    },
                    unit_amount: Math.round(price * 100), 
                },
                quantity: 1,
            }],
            mode: 'payment',
            metadata: {
                purchaseId: purchase._id.toString()
            }
        });

        res.json({ success: true, sessionUrl: session.url });

    } catch (error) {
        console.error('Stripe payment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


export const stripeSuccess = async (req, res) => {
    const { purchaseId } = req.query;

    try {
        const purchase = await Purchase.findById(purchaseId);
        if (!purchase) throw new Error('Không tìm thấy giao dịch');

        purchase.status = 'completed';
        await purchase.save();

        const user = await User.findById(purchase.userId);
        const course = await Course.findById(purchase.courseId);

        if (user && course) {
            user.enrolledCourses.push(purchase.courseId);
            course.enrolledStudents.push(purchase.userId);

            await user.save();
            await course.save();
        }

        const origin = req.get('origin') || req.get('referer')?.replace(/\/[^/]*$/, '') || 'http://localhost:5173';
        res.redirect(`${origin}/my-enrollments`);
    } catch (error) {
        console.error('Stripe success error:', error);
        const origin = req.get('origin') || req.get('referer')?.replace(/\/[^/]*$/, '') || 'http://localhost:5173';
        res.redirect(`${origin}/payment-error?code=stripe_failed`);
    }
};

export const stripeCancel = async (req, res) => {
    const { purchaseId } = req.query;

    try {
        await Purchase.findByIdAndDelete(purchaseId);
    } catch (error) {
        console.error('Stripe cancel error:', error);
    }
    const origin = req.get('origin') || req.get('referer')?.replace(/\/[^/]*$/, '') || 'http://localhost:5173';
    res.redirect(`${origin}/courses`);
};
