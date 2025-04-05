import express from 'express'
import {
    addUserRating,
    getUserCourseProgress, getUserData,
    purchaseCourse, updateUserCourseProgress,
    userEnrolledCourses, getAllCompletedCourses,enrollCourses
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
export default userRouter;