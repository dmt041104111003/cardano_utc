import express from 'express'

import upload from '../configs/multer.js';
import { protectEducator } from '../middlewares/authMiddleware.js'
import {
    addCourse, deleteCourse, deleteAllCourses, educatorDashboardData,
    getEducatorCourses, getEnrolledStudentsData, updateCourse,
    updatetoRoleToEducator, educatorDetails, unstopCourse, unstopAllCourses
} from '../controllers/educatorController.js';

const educatorRouter = express.Router()

educatorRouter.get('/details/:id', educatorDetails);


educatorRouter.get('/update-role', updatetoRoleToEducator)
educatorRouter.post('/add-course', upload.single('image'), protectEducator, addCourse)
educatorRouter.get('/courses', protectEducator, getEducatorCourses)
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData)
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData)
educatorRouter.put("/update-course", upload.single("image"), protectEducator, updateCourse);
educatorRouter.delete('/delete-course/:courseId', protectEducator, deleteCourse);
educatorRouter.delete('/delete-all-courses', protectEducator, deleteAllCourses);
educatorRouter.put('/unstop-course/:courseId', protectEducator, unstopCourse);
educatorRouter.put('/unstop-all-courses', protectEducator, unstopAllCourses);
export default educatorRouter;
