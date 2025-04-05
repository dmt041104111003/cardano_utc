import User from "../models/User.js"
import { Purchase } from "../models/Purchase.js";
import Stripe from "stripe"
import Course from "../models/course.js"
import { CourseProgress } from "../models/CourseProgress.js";
import mongoose from "mongoose";
import moment from "moment"

export const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId
        const user = await User.findById(userId)

        if (!user) {
            return res.json({ success: false, message: 'User not Found' })
        }

        res.json({ success: true, user })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId
        const userData = await User.findById(userId).populate('enrolledCourses')
        res.json({ success: true, enrolledCourses: userData.enrolledCourses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


export const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const { origin } = req.headers
        const userId = req.auth.userId
        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data Not Found' })
        }

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: courseData.coursePrice - (courseData.discount * courseData.coursePrice / 100)
        }

        // Nếu giá = 0, tự động enroll
        if (purchaseData.amount === 0) {
            await User.findByIdAndUpdate(
                userId,
                { $addToSet: { enrolledCourses: courseId } }
            );
            
            await Purchase.create({
                ...purchaseData,
                status: 'completed'
            });

            return res.json({ 
                success: true,
                message: 'Enrolled successfully',
                redirect_url: `${origin}/loading/my-enrollments`
            });
        }

        const newPurchase = await Purchase.create(purchaseData)

        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
        const currency = process.env.CURRENCY.toLowerCase()

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.round(newPurchase.amount * 100) // Convert to cents and round
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })
        res.json({ success: true, session_url: session.url })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}



export const getAllCompletedCourses = async (req, res) => {
    try {
        const allProgress = await CourseProgress.find()
            .populate("userId", "name")
            .populate({
                path: "courseId",
                select: "courseTitle courseContent",
                model: Course
            });

        if (!allProgress.length) {
            return res.json({ success: true, completedCourses: [], message: "No progress records found" });
        }

        const completedCourses = await Promise.all(
            allProgress.map(async (progress) => {
                if (!progress.userId || !progress.courseId) {
                    console.log("Invalid progress entry (missing userId or courseId):", progress);
                    return null;
                }

                const course = progress.courseId;

                if (!course || typeof course !== "object") {
                    console.log(`Course not populated for courseId: ${progress.courseId}`);
                    return null;
                }

                console.log("Populated userId:", JSON.stringify(progress.userId, null, 2));
                console.log("Populated course:", JSON.stringify(course, null, 2));

                if (!course.courseContent || !Array.isArray(course.courseContent)) {
                    console.log(`Course ${course.courseTitle || progress.courseId} has no valid courseContent`);
                    return null;
                }

                const totalLectures = course.courseContent.reduce(
                    (total, chapter) => total + (chapter.chapterContent ? chapter.chapterContent.length : 0),
                    0
                );

                if (totalLectures === 0) {
                    console.log(`Course ${course.courseTitle} has no lectures`);
                    return null;
                }

                const completedLectures = progress.lectureCompleted ? progress.lectureCompleted.length : 0;
                const isCompleted = totalLectures > 0 && completedLectures === totalLectures;

                if (isCompleted) {
                    return {
                        courseId: course._id,
                        courseTitle: course.courseTitle || "Unnamed Course",
                        userId: progress.userId._id,
                        name: progress.userId.name || "Người dùng",
                        completionDate: progress.updatedAt || new Date(),
                    };
                }
                return null;
            })
        );

        const filteredCompletedCourses = completedCourses.filter((course) => course !== null);

        res.json({
            success: true,
            completedCourses: filteredCompletedCourses,
            message: filteredCompletedCourses.length === 0 ? "No completed courses found" : undefined
        });
    } catch (error) {
        console.error("Error in getAllCompletedCourses:", error);
        res.json({ success: false, message: error.message });
    }
};
export const updateUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { courseId, lectureId } = req.body

        // Lấy thông tin khóa học 
        const course = await Course.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: 'Course not found' });

        }
        console.log('Course data:', JSON.stringify(course, null, 2));

        // Lấy hoặc tạo mới progress data
        let progressData = await CourseProgress.findOne({ userId, courseId });
        if (!progressData) {
            progressData = await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: []
            });
        }

        // Kiểm tra xem lecture đã hoàn thành chưa
        if (progressData.lectureCompleted.includes(lectureId)) {
            return res.json({ success: true, message: 'Lecture Already Completed' });
        }

        // Thêm lecture vào danh sách đã hoàn thành
        progressData.lectureCompleted.push(lectureId);

        // Đếm tổng số lecture từ courseContent
        let totalLectures = 0;
        if (course.courseContent) {
            course.courseContent.forEach(chapter => {
                if (chapter.chapterContent) {
                    totalLectures += chapter.chapterContent.length;
                }
            });
        }

        const numCompleted = progressData.lectureCompleted.length;
        console.log(`Course ${courseId}: ${numCompleted}/${totalLectures} lectures completed`);

        if (totalLectures > 0 && numCompleted >= totalLectures) {
            // Đánh dấu đã hoàn thành
            progressData.completed = true;
            console.log(`Course ${courseId} marked as completed for user ${userId}`);
        }

        await progressData.save();
        res.json({ 
            success: true, 
            message: 'Progress Updated',
            completed: progressData.completed,
            progress: `${numCompleted}/${totalLectures}`
        });

    } catch (error) {
        console.error('Error updating progress:', error);
        res.json({ success: false, message: error.message });
    }
};

export const getUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { courseId } = req.body
        const progressData = await CourseProgress.findOne({ userId, courseId })
        res.json({ success: true, progressData })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const addUserRating = async (req, res) => {
    const userId = req.auth.userId;
    const { courseId, rating } = req.body;
    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: 'InValid Datails' });
    }

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: 'Course not found' });

        }
        const user = await User.findById(userId);

        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'User has not purchased this course.' });
        }

        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId)
        if (existingRatingIndex > -1) {
            course.courseRatings[existingRatingIndex].rating = rating;
        } else {
            course.courseRatings.push({ userId, rating });
        }
        await course.save();
        return res.json({ success: true, message: 'Rating added' });
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const enrollCourses = async (req, res) => {
    const { origin } = req.headers;
    const userId = req.auth.userId;
    let { courseId,paymentMethod,currency } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }
    courseId = new mongoose.Types.ObjectId(courseId);

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
        return res.status(404).json({ success: false, message: 'User or course not found' });
    }
  
    try {
        if (!user.enrolledCourses.includes(courseId)) {
            user.enrolledCourses.push(courseId);
            course.enrolledStudents.push(userId); 

            const purchaseData = {
                courseId,
                userId,
                amount: (
                    course.coursePrice - (course.discount * course.coursePrice) / 100
                ).toFixed(2),
                status: "completed",
                currency: currency,
                paymentMethod: paymentMethod,
                createdAt: new Date(),
                note: ""
            };
            await Purchase.create(purchaseData);

            await user.save();
            await course.save(); 

            return res.json({ success: true, message: 'Courses enrolled successfully' });
        } else {
            return res.json({ success: false, message: 'You are already enrolled in this course' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
