import Course from "../models/course.js";



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
