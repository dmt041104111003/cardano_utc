import express from 'express'
import { getAllCourse, getCourseId, getTopRatedCourses } from '../controllers/courseController.js'
import {paymentByAda} from '../controllers/transactionController.js'

const courseRouter = express.Router()

courseRouter.get('/top-rated', getTopRatedCourses)
courseRouter.get('/all', getAllCourse)
courseRouter.get('/:id', getCourseId)
courseRouter.post('/payment', paymentByAda)

export default courseRouter;