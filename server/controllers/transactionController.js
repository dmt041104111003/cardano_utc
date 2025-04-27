import {sendAda} from "../utils/BlockchainUtils.js";
import paypal from 'paypal-rest-sdk';
import dotenv from 'dotenv';
import Course from "../models/Course.js";
import Stripe from 'stripe';
import User from "../models/User.js";
import { Purchase } from "../models/Purchase.js";


export const paymentByAda = async (req, res) => {
    const { utxos, changeAddress, getAddress,value} = req.body;

    try {
        const unsignedTx = await sendAda(utxos, changeAddress, getAddress,value);
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
  
  export const paymentByPaypal = async (req, res) => {
    const { courseName, courseId, price, userId } = req.body;
  
  
    try {
    
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
  
      const create_payment_json = {
        intent: 'sale',
        payer: { payment_method: 'paypal' },
        redirect_urls: {
          return_url: `http://localhost:5000/api/course/paypal-success?courseId=${courseId}&userId=${userId}`,
          cancel_url: `http://localhost:5000/api/course/paypal-cancel`
        },
        transactions: [{
          item_list: {
            items: [{
              name: courseName,
              sku: courseId,
              price: price,
              currency: 'USD',
              quantity: 1
            }]
          },
          amount: {
            currency: 'USD',
            total: price
          },
          description: `Payment for course: ${courseName}`,
          invoice_number: `INV-${Date.now()}` 
        }]
      };
  
   
      const payment = await new Promise((resolve, reject) => {
        paypal.payment.create(create_payment_json, (error, payment) => {
          if (error) reject(error);
          else resolve(payment);
        });
      });
  
      const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
      if (!approvalUrl) {
        throw new Error('No PayPal approval URL found');
      }
  
      res.json({ 
        forwardLink: approvalUrl.href,
        paymentId: payment.id 
      });
  
    } catch (error) {
      console.error('PayPal payment creation error:', error);
      res.status(500).json({ 
        error: error.response?.message || 'Failed to create PayPal payment',
        details: process.env.NODE_ENV === 'development' ? error.response : undefined
      });
    }
  };
  

export const paypalSuccess = async (req, res) => {
    const { PayerID: payerId, paymentId, courseId, userId } = req.query;

    console.log("Thanh toán thanh cong: ", req.query);
    try {
       
        const payment = await new Promise((resolve, reject) => {
            paypal.payment.execute(paymentId, { payer_id: payerId }, (error, payment) => {
                if (error) reject(error);
                else resolve(payment);
            });
        });

        if (payment.state !== 'approved') {
            throw new Error('Thanh toán không thành công');
        }


        const paymentRecord = new Purchase({
            courseId,
            userId,
            amount: payment.transactions[0].amount.total,
            status: 'completed', 
            currency: 'USD',
            paymentMethod: 'Paypal payment',
            receiverAddress: process.env.PAYPAL_BUSINESS_EMAIL,
            note:"Thanh toán thanh cong",
            createdAt: new Date(),
            
        });

        await paymentRecord.save();

        const course = await Course.findById(courseId);
        if (!course) {
            throw new Error('Không tìm thấy khóa học');
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('Không tìm thấy người dùng');
        }

        user.enrolledCourses.push(courseId);
        course.enrolledStudents.push(userId); 

        await user.save();
        await course.save(); 

        res.redirect(`http://localhost:5173/my-enrollments`);
        
    } catch (error) {
        console.error('Lỗi khi xử lý thanh toán PayPal:', error);
        res.redirect(`${process.env.FRONTEND_URL}/payment-error?code=paypal_failed`);
    }
};

  
  export const paypalCancel = (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/courses/${req.query.courseId}?payment=cancelled`);
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
            success_url: `${process.env.BACKEND_URL}/api/course/stripe-success?purchaseId=${purchase._id}`,
            cancel_url: `${process.env.BACKEND_URL}/api/course/stripe-cancel?purchaseId=${purchase._id}`,
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

        res.redirect(`${process.env.FRONTEND_URL}/my-enrollments`);
    } catch (error) {
        console.error('Stripe success error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/payment-error?code=stripe_failed`);
    }
};

export const stripeCancel = async (req, res) => {
    const { purchaseId } = req.query;

    try {
        await Purchase.findByIdAndDelete(purchaseId);
    } catch (error) {
        console.error('Stripe cancel error:', error);
    }
    res.redirect(`${process.env.FRONTEND_URL}/courses`);
};
