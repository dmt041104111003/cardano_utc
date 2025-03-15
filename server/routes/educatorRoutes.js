import express from 'express'

import upload from '../configs/multer.js';
import { protectEducator } from '../middlewares/authMiddleware.js'
import { addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updatetoRoleToEducator } from '../controllers/educatorController.js';

const educatorRouter = express.Router()

educatorRouter.get('/update-role', updatetoRoleToEducator)
educatorRouter.post('/add-course', upload.single('image'), protectEducator,
    addCourse)
educatorRouter.get('/courses', protectEducator, getEducatorCourses)
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData)
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData)
export default educatorRouter;
