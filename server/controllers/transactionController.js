import {sendAda} from "../utils/BlockchainUtils.js";
import paypal from 'paypal-rest-sdk';
import dotenv from 'dotenv';
import Course from "../models/Course.js";
import Stripe from 'stripe';
import User from "../models/User.js";
import { Purchase } from "../models/Purchase.js";


export const paymentByAda = async (req, res) => {
    const { utxos, changeAddress, getAddress, value, courseId, userId, redirectUrl } = req.body;

    try {
        // Check if user already owns the course
        const user = await User.findById(userId);
        if (user && user.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'You already own this course.',
                redirectUrl: `${redirectUrl || 'https://client-react-brown.vercel.app'}/my-enrollments?status=info&message=You already own this course.`
            });
        }
        const unsignedTx = await sendAda(utxos, changeAddress, getAddress, value);
        if (!unsignedTx) {
            return res.status(500).json({ 
                success: false, 
                message: "Loi thanh toan",
                redirectUrl: `${redirectUrl || 'https://client-react-brown.vercel.app'}/my-enrollments?status=error&message=Payment failed. Please try again.`
            });
        }
        res.json({ 
            success: true, 
            unsignedTx,
            redirectUrl: `${redirectUrl || 'https://client-react-brown.vercel.app'}/my-enrollments?status=success&message=Payment successful! You are now enrolled in the course.`
        });
    } catch (error) {
        console.error("Lỗi thanh toan:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message,
            redirectUrl: `${redirectUrl || 'https://client-react-brown.vercel.app'}/my-enrollments?status=error&message=${encodeURIComponent(error.message)}`
        });
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

        if (!course) {
            throw new Error('Course not found');
        }

        // Kiểm tra xem người dùng đã đăng ký khóa học này chưa
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Kiểm tra xem người dùng đã đăng ký khóa học này chưa
        const isAlreadyEnrolled = user.enrolledCourses.includes(courseId);
        
        if (isAlreadyEnrolled) {
            console.log(`User ${userId} already enrolled in course ${courseId}. Skipping enrollment.`);
            // Vẫn chuyển hướng đến trang my-enrollments nhưng với thông báo khác
            const origin = req.get('origin') || 'https://client-react-brown.vercel.app';
            return res.redirect(`${origin}/my-enrollments?status=info&message=You are already enrolled in this course.`);
        }

        // Create purchase record
        await Purchase.create({
            courseId,
            userId,
            amount: payment.transactions[0].amount.total,
            currency: payment.transactions[0].amount.currency,
            status: 'completed',
            paymentMethod: 'PayPal payment',
            paymentId: payment.id,
            payerId: payerId,
            receiverAddress: educator?.paypalEmail || 'No educator email',
            note: 'Payment completed',
            createdAt: new Date(),
        });

        // Update user and course
        user.enrolledCourses.push(courseId);
        course.enrolledStudents.push(userId);
        await user.save();
        await course.save();

        const origin = req.get('origin') || 'https://client-react-brown.vercel.app';
        res.redirect(`${origin}/my-enrollments?status=success&message=Payment successful! You are now enrolled in the course.`);
    } catch (error) {
        console.error('PayPal success error:', error);
        const origin = req.get('origin') || 'https://client-react-brown.vercel.app';
        res.redirect(`${origin}/my-enrollments?status=error&message=${encodeURIComponent(error.message)}`);
    }
};

export const paypalCancel = async (req, res) => {
    const origin = req.get('origin') || 'https://client-react-brown.vercel.app';
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

        // Đảm bảo giá trị price là số hợp lệ
        const priceValue = parseFloat(price);
        if (isNaN(priceValue) || priceValue <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid price value' });
        }

        const purchase = await Purchase.create({
            courseId,
            userId,
            amount: priceValue,
            currency: 'USD',
            status: 'pending',
            paymentMethod: 'Stripe payment',
            receiverAddress: process.env.STRIPE_ACCOUNT_EMAIL || 'admin@example.com',
            note: `Payment for course: ${courseName}`,
            createdAt: new Date(),
        });

        // Tạo session Stripe với thông tin chi tiết hơn
        const clientOrigin = req.get('origin') || 'https://client-react-brown.vercel.app';
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            success_url: `${clientOrigin}/my-enrollments?purchase_id=${purchase._id.toString()}&status=success`,
            cancel_url: `${clientOrigin}/courses?status=cancelled`,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: courseName,
                        description: `Course enrollment`,
                    },
                    unit_amount: Math.round(priceValue * 100), // Chuyển đổi sang cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            metadata: {
                purchaseId: purchase._id.toString(),
                courseId: courseId,
                userId: userId
            },
            client_reference_id: purchase._id.toString(),
        });

        // Lưu session ID vào purchase để có thể kiểm tra sau này
        purchase.paymentId = session.id;
        await purchase.save();

        res.json({ success: true, sessionUrl: session.url });

    } catch (error) {
        console.error('Stripe payment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


export const stripeSuccess = async (req, res) => {
    // Lấy purchase_id từ query parameters
    const { purchase_id } = req.query;
    
    try {
        // Nếu không có purchase_id, trả về lỗi
        if (!purchase_id) {
            throw new Error('Missing purchase ID');
        }

        // Tìm giao dịch trong database
        const purchase = await Purchase.findById(purchase_id);
        if (!purchase) {
            throw new Error('Transaction not found');
        }

        // Kiểm tra nếu giao dịch đã hoàn thành rồi thì không cần xử lý nữa
        if (purchase.status === 'completed') {
            console.log(`Purchase ${purchase_id} already completed. Redirecting to enrollments.`);
            return res.redirect('/my-enrollments?status=success&message=You are already enrolled in this course.');
        }

        // Cập nhật trạng thái giao dịch thành 'completed'
        purchase.status = 'completed';
        purchase.note = 'Payment completed via Stripe';
        purchase.updatedAt = new Date();
        await purchase.save();

        // Tìm thông tin người dùng và khóa học
        const user = await User.findById(purchase.userId);
        const course = await Course.findById(purchase.courseId);

        if (!user) {
            throw new Error('User not found');
        }

        if (!course) {
            throw new Error('Course not found');
        }

        // Kiểm tra xem người dùng đã đăng ký khóa học này chưa
        const alreadyEnrolled = user.enrolledCourses.includes(purchase.courseId);
        if (!alreadyEnrolled) {
            // Thêm khóa học vào danh sách đăng ký của người dùng
            user.enrolledCourses.push(purchase.courseId);
            await user.save();
            console.log(`User ${user._id} enrolled in course ${purchase.courseId}`);
        }

        // Kiểm tra xem khóa học đã có học viên này chưa
        const studentEnrolled = course.enrolledStudents.includes(purchase.userId);
        if (!studentEnrolled) {
            // Thêm học viên vào danh sách của khóa học
            course.enrolledStudents.push(purchase.userId);
            await course.save();
            console.log(`Course ${course._id} added student ${purchase.userId}`);
        }

        // Chuyển hướng người dùng đến trang my-enrollments với thông báo thành công
        const clientOrigin = req.get('origin') || 'https://client-react-brown.vercel.app';
        res.redirect(`${clientOrigin}/my-enrollments?status=success&message=Payment successful! You are now enrolled in the course.`);
    } catch (error) {
        console.error('Stripe success handler error:', error);
        const clientOrigin = req.get('origin') || 'https://client-react-brown.vercel.app';
        res.redirect(`${clientOrigin}/my-enrollments?status=error&message=${encodeURIComponent(error.message || 'Payment processing failed')}`);

    }
};

export const stripeCancel = async (req, res) => {
    const { purchaseId } = req.query;

    try {
        await Purchase.findByIdAndDelete(purchaseId);
    } catch (error) {
        console.error('Stripe cancel error:', error);
    }
    const origin = req.get('origin') || req.get('referer')?.replace(/\/[^/]*$/, '') || 'https://client-react-brown.vercel.app';
    res.redirect(`${origin}/courses`);
};
