import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/course.js";
import Notification from "../models/notification.js";

export const clerkWebhooks = async (req, res) => {
    try {
        const svixHeaders = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        try {
            whook.verify(JSON.stringify(req.body), svixHeaders);
        } catch (err) {
            console.error("Webhook verification failed:", err);
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { data, type } = req.body;

        if (!data?.id || !data?.email_addresses?.[0]?.email_address) {
            return res.status(400).json({ success: false, message: "Invalid payload" });
        }

        switch (type) {
            case "user.created": {
                await User.create({
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name} ${data.last_name}`,
                    imageUrl: data.image_url,
                });
                return res.status(200).json({ success: true });
            }

            case "user.updated": {
                await User.findByIdAndUpdate(data.id, {
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name} ${data.last_name}`,
                    imageUrl: data.image_url,
                });
                return res.status(200).json({ success: true });
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                return res.status(200).json({ success: true });
            }

            default:
                return res.status(400).json({ success: false, message: "Unsupported event type" });
        }
    } catch (error) {
        console.error("Webhook error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
    const sig = request.headers['stripe-signature'];
    let event;
    try {
        event = Stripe.webhooks.constructEvent(request.body, sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        response.status(400).send(`Webhook Error : ${error.message}`);
        return;
    }

    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                const paymentIntentId = paymentIntent.id;
                const session = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntentId
                });

                const { purchaseId } = session.data[0].metadata;
                const purchaseData = await Purchase.findById(purchaseId);
                const userData = await User.findById(purchaseData.userId);
                const courseData = await Course.findById(purchaseData.courseId.toString());

                // Update course enrollments
                courseData.enrolledStudents.push(userData);
                await courseData.save();

                // Update user courses
                userData.enrolledCourses.push(courseData._id);
                await userData.save();

                // Update purchase status
                purchaseData.status = 'completed';
                await purchaseData.save();

                // Create notification
                const notification = new Notification({
                    studentId: userData._id,
                    courseId: courseData._id,
                    educatorId: courseData.educator,
                    status: 'unread'
                });
                await notification.save();

                console.log("Created notification:", {
                    studentId: userData._id,
                    courseId: courseData._id,
                    educatorId: courseData.educator
                });

                break;
            }
            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                const paymentIntentId = paymentIntent.id;

                const session = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntentId
                });
                const { purchaseId } = session.data[0].metadata;
                const purchaseData = await Purchase.findById(purchaseId);
                purchaseData.status = 'failed';
                await purchaseData.save();
                break;
            }

            default:
                console.log(`Unhandle event type ${event.type}`);
        }
        response.json({ received: true });
    } catch (error) {
        console.error("Error processing webhook:", error);
        response.status(500).json({ error: error.message });
    }
};
