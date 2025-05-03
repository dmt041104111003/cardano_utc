import { clerkClient } from "@clerk/express";
import Course from "../models/Course.js";
import { v2 as cloudinary } from "cloudinary";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";
import { bufferToStream } from '../configs/multer.js';
import Certificate from "../models/Certificate.js";

export const updatetoRoleToEducator = async (req, res) => {
    try {
        const userId = req.auth.userId;

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: "educator",
            },
        });
        res.json({ success: true, message: "You can publish a course now" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const imageFile = req.file;
        const educatorId = req.auth.userId;

        if (!imageFile) {
            return res.json({ success: false, message: "Thumbnail Not Attached" });
        }

        // Check if user is premium
        const user = await User.findById(educatorId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const parsedCourseData = await JSON.parse(courseData);
        parsedCourseData.educator = educatorId;
        // Nếu có paypalEmail, cập nhật vào User
        if (parsedCourseData.paypalEmail) {
            await User.findByIdAndUpdate(educatorId, { paypalEmail: parsedCourseData.paypalEmail });
        }
        const newCourse = await Course.create(parsedCourseData);

        // Tạo stream từ buffer và upload lên Cloudinary
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "course_thumbnails" },
                (error, result) => {
                    if (error) {
                        console.error("Upload error:", error);
                        reject(error);
                        return;
                    }
                    newCourse.courseThumbnail = result.secure_url;
                    newCourse.save()
                        .then(() => {
                            resolve(res.json({ success: true, message: "Course Added" }));
                        })
                        .catch(err => {
                            reject(err);
                        });
                }
            );
            bufferToStream(imageFile.buffer).pipe(stream);
        }).catch(error => {
            res.json({ success: false, message: error.message });
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


export const getEducatorCourses = async (req, res) => {
    try {
        const educator = req.auth.userId;
        // Lấy tất cả khóa học của giáo viên, bao gồm cả những khóa học đã bị đánh dấu là xóa
        const courses = await Course.find({ educator });
        res.json({ success: true, courses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Dữ liệu dashboard của educator
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        const totalCourses = courses.length;
     
        const courseIds = courses.map((course) => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: "completed",
        });

        const totalEarnings = Number(purchases.reduce((sum, purchase) => sum + purchase.amount, 0).toFixed(2));

        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await User.find(
                { _id: { $in: course.enrolledStudents } },
                "name imageUrl"
            );

            students.forEach((student) => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student,
                });
            });
        }

        res.json({
            success: true,
            dashboardData: { totalEarnings, enrolledStudentsData, totalCourses },
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Lấy dữ liệu học viên đã đăng ký
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        const courseIds = courses.map((course) => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: "completed",
        })
            .populate("userId", "name imageUrl")
            .populate("courseId", "courseTitle");

        const enrolledStudents = purchases.map((purchase) => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt,
        }));

        res.json({ success: true, enrolledStudents });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};



export const updateCourse = async (req, res) => {
    try {
        const educatorId = req.auth.userId;
        const { courseId, courseData } = req.body;
        const imageFile = req.file;

        // Log dữ liệu nhận được
        console.log("Received data:", { courseId, courseData, imageFile });

        // Kiểm tra dữ liệu đầu vào
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }
        if (!courseData) {
            return res.status(400).json({
                success: false,
                message: "Course data is required",
            });
        }

        // Parse courseData
        let parsedCourseData;
        try {
            parsedCourseData = JSON.parse(courseData);
        } catch (parseError) {
            console.error("Error parsing courseData:", parseError);
            return res.status(400).json({
                success: false,
                message: "Invalid courseData format. Expected valid JSON.",
            });
        }

        // Tìm khóa học
        const course = await Course.findOne({ _id: courseId, educator: educatorId });
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found or you are not authorized to edit this course",
            });
        }

        // Cập nhật dữ liệu khóa học
        Object.assign(course, parsedCourseData);
        
        // Đánh dấu khóa học đã được cập nhật
        course.isUpdated = true;
        course.lastUpdated = new Date();

        // Xử lý upload ảnh nếu có
        if (imageFile) {
            try {
                // Tạo stream từ buffer và upload lên Cloudinary
                await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "course_thumbnails" },
                        (error, result) => {
                            if (error) {
                                console.error("Upload error:", error);
                                reject(error);
                                return;
                            }
                            course.courseThumbnail = result.secure_url;
                            resolve();
                        }
                    );
                    bufferToStream(imageFile.buffer).pipe(stream);
                });
                console.log("Image uploaded:", course.courseThumbnail);
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading image"
                });
            }
        }

        // Lưu khóa học
        await course.save();

        return res.status(200).json({
            success: true,
            message: "Course updated successfully",
            course,
        });
    } catch (error) {
        console.error("Error in updateCourse:", error.stack);
        return res.status(500).json({
            success: false,
            message: "Server error: " + error.message,
        });
    }
};
// Xóa khóa học
export const deleteCourse = async (req, res) => {
    try {
        const educatorId = req.auth.userId;
        const { courseId } = req.params;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        const course = await Course.findOne({ _id: courseId, educator: educatorId });
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found or you are not authorized to delete this course",
            });
        }

        // Thay vì xóa khóa học, chỉ đánh dấu là đã xóa
        await Course.findByIdAndUpdate(courseId, { isDeleted: true });

        return res.status(200).json({
            success: true,
            message: "Course marked as deleted successfully",
        });
    } catch (error) {
        console.error("Error in deleteCourse:", error);
        return res.status(500).json({
            success: false,
            message: "Server error: " + error.message,
        });
    }
};

// Xóa tất cả khóa học của educator
export const deleteAllCourses = async (req, res) => {
    try {
        const educatorId = req.auth.userId;
        
        // Tìm tất cả khóa học của educator
        const courses = await Course.find({ educator: educatorId });
        
        if (courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No courses found for this educator",
            });
        }
        
        // Đánh dấu tất cả khóa học là đã xóa thay vì xóa chúng
        await Course.updateMany(
            { educator: educatorId }, 
            { $set: { isDeleted: true } }
        );
        
        return res.status(200).json({
            success: true,
            message: `${courses.length} courses marked as stopped successfully`,
        });
    } catch (error) {
        console.error("Error in deleteAllCourses:", error);
        return res.status(500).json({
            success: false,
            message: "Server error: " + error.message,
        });
    }
};


// get edu detail
export const educatorDetails  = async (req, res) => {
    try {
        const educatorId = req.params.id.trim();

        console.log(educatorId);

        if (!educatorId) {
            return res.status(400).json({ success: false, message: 'Educator ID is required' });
        }

       
        const courses = await Course.find({ educator: educatorId });

        const totalCourses = courses.length;
        console.log("educator id", educatorId);

        
        const totalEnrolledStudents = courses.reduce(
            (sum, course) => sum + (course.enrolledStudents?.length || 0),
            0
        );

        let totalRatings = 0;
        let totalRatingPoints = 0;

       
        courses.forEach(course => {
            const ratings = course.courseRatings || [];
            totalRatings += ratings.length;
            totalRatingPoints += ratings.reduce((sum, r) => sum + r.rating, 0);
        });

        const averageRating = totalRatings > 0 
            ? Number((totalRatingPoints / totalRatings).toFixed(2))
            : 0;

        
        const certificates = await Certificate.find({ issueBy: educatorId });
        const totalCertificates = certificates.length;

        res.json({
            success: true,
            educatorData: {
                totalCourses,
                totalEnrolledStudents,
                averageRating,
                totalCertificates,  
                bio: 'No bio available'
            },
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
};

// Khôi phục khóa học đã bị dừng
export const unstopCourse = async (req, res) => {
    try {
        const educatorId = req.auth.userId;
        const { courseId } = req.params;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        const course = await Course.findOne({ _id: courseId, educator: educatorId });
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found or you are not authorized to unstop this course",
            });
        }

        // Đánh dấu khóa học là không bị dừng nữa
        await Course.findByIdAndUpdate(courseId, { isDeleted: false });

        return res.status(200).json({
            success: true,
            message: "Course has been successfully unstoped",
        });
    } catch (error) {
        console.error("Error in unstopCourse:", error);
        return res.status(500).json({
            success: false,
            message: "Server error: " + error.message,
        });
    }
};

// Khôi phục tất cả khóa học đã bị dừng
export const unstopAllCourses = async (req, res) => {
    try {
        const educatorId = req.auth.userId;
        
        // Tìm tất cả khóa học đã bị dừng của educator
        const courses = await Course.find({ educator: educatorId, isDeleted: true });
        
        if (courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No stopped courses found for this educator",
            });
        }
        
        // Đánh dấu tất cả khóa học là không bị dừng nữa
        await Course.updateMany(
            { educator: educatorId, isDeleted: true }, 
            { $set: { isDeleted: false } }
        );
        
        return res.status(200).json({
            success: true,
            message: `${courses.length} courses have been successfully unstoped`,
        });
    } catch (error) {
        console.error("Error in unstopAllCourses:", error);
        return res.status(500).json({
            success: false,
            message: "Server error: " + error.message,
        });
    }
};
