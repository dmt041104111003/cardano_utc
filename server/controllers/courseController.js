import Course from "../models/Course.js";
import User from "../models/User.js"; // Add this line to import the User model

export const getTopRatedCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true, isDeleted: { $ne: true } })
            .select(['courseTitle', 'courseDescription', 'courseThumbnail', 'coursePrice', 'courseRatings', 'discount', 'discountEndTime', 'educator'])
            .populate('educator', 'name email')
            .lean();

        // Calculate average rating and total ratings for each course
        const coursesWithRating = courses.map(course => {
            const ratings = course.courseRatings || [];
            const totalRatings = ratings.length;
            const averageRating = totalRatings > 0
                ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
                : 0;

            // Calculate discounted price
            let finalPrice = course.coursePrice;
            if (course.discount > 0 && course.discountEndTime && new Date(course.discountEndTime) > new Date()) {
                finalPrice = finalPrice * (1 - course.discount / 100);
            }

            return {
                ...course,
                rating: averageRating,
                totalRatings,
                price: finalPrice,
                hasDiscount: course.discount > 0 && course.discountEndTime && new Date(course.discountEndTime) > new Date(),
                originalPrice: course.coursePrice
            };
        });

        // Sort by rating and get top 3
        const topCourses = coursesWithRating
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3);

        res.json({ success: true, courses: topCourses });
    } catch (error) {
        console.error('Error in getTopRatedCourses:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllCourse = async (req, res) => {
    
    try {
        const courses = await Course.find({ isPublished: true, isDeleted: { $ne: true } }).select(['-courseContent',
            '-enrolledStudents'
        ]).populate({ path: 'educator' })

        res.json({ success: true, courses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const getCourseId = async (req, res) => {
    const { id } = req.params
    try {
        const courseData = await Course.findById(id).populate({ path: 'educator' });
        
        if (!courseData) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // Kiểm tra xem khóa học có bị dừng không và người dùng có đăng ký khóa học này không
        if (courseData.isDeleted) {
            // Nếu người dùng đã đăng nhập, kiểm tra xem họ đã đăng ký khóa học này chưa
            if (req.auth && req.auth.userId) {
                const user = await User.findById(req.auth.userId);
                const isEnrolled = user.enrolledCourses.includes(id);
                
                // Nếu không phải học viên đã đăng ký, trả về thông báo lỗi
                if (!isEnrolled) {
                    return res.status(403).json({ success: false, message: "This course has been stopped by the educator" });
                }
                // Nếu là học viên đã đăng ký, cho phép truy cập
            } else {
                // Nếu không đăng nhập, không cho phép truy cập khóa học đã dừng
                return res.status(403).json({ success: false, message: "This course has been stopped by the educator" });
            }
        }

        // Mask lecture URLs for unpurchased courses
        if (courseData.courseContent) {
            courseData.courseContent.forEach(chapter => {
                chapter.chapterContent.forEach(lecture => {
                    if (!lecture.isPreviewFree) {
                        lecture.lectureUrl = "";
                    }
                })
            });
        }

        console.log('Course data:', courseData);
        res.json({ success: true, courseData });

    } catch (error) {
        console.error('Error getting course:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getCoursesByEducator = async (req, res) => {
  try {
    const { educatorId } = req.params;
    const excludeId = req.query.excludeId;
    const query = { educator: educatorId, isDeleted: { $ne: true } };
    if (excludeId) query._id = { $ne: excludeId };
    const courses = await Course.find(query).populate('educator');
    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
