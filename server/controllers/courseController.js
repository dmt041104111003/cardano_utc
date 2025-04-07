import Course from "../models/Course.js";

export const getTopRatedCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
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
        const courses = await Course.find({ isPublished: true }).select(['-courseContent',
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
