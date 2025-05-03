import express from 'express'
import {
    addUserRating,
    getUserCourseProgress, getUserData,
    purchaseCourse, updateUserCourseProgress,
    userEnrolledCourses, getAllCompletedCourses,
    enrollCourses, updateCourseEducator, getSimpleCertificateData,
    getUserPurchaseHistory, resetCourseProgress
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
userRouter.post('/get-simple-certificate', getSimpleCertificateData)
userRouter.get('/purchase/history', getUserPurchaseHistory)
userRouter.post('/reset-course-progress', resetCourseProgress)

userRouter.get('/test-schema', async (req, res) => {
    try {
        const progress = await CourseProgress.findOne();
        res.json({ success: true, schema: progress?.schema?.paths || 'No records found' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

export default userRouter;