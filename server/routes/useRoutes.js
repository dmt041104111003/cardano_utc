import express from 'express'
import {
    addUserRating,
    getUserCourseProgress, getUserData,
    purchaseCourse, updateUserCourseProgress,
    userEnrolledCourses, getAllCompletedCourses,
    enrollCourses, updateCourseEducator
}
    from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.get('/data', getUserData)
userRouter.get('/enrolled-courses', userEnrolledCourses)
userRouter.post('/purchase', purchaseCourse)
userRouter.get("/all-completed-courses", getAllCompletedCourses);
userRouter.post('/update-course-progress', updateUserCourseProgress)
userRouter.post('/get-course-progress', getUserCourseProgress)
userRouter.post('/add-rating', addUserRating)
userRouter.post('/enroll-course', enrollCourses)
userRouter.post('/update-course-educator', updateCourseEducator)

// Test route to verify schema
userRouter.get('/test-schema', async (req, res) => {
    try {
        const progress = await CourseProgress.findOne();
        res.json({ success: true, schema: progress?.schema?.paths || 'No records found' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

export default userRouter;