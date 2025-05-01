import express from 'express'
import { getAllCourse, getCourseId, getTopRatedCourses, getCoursesByEducator } from '../controllers/courseController.js'
import {paymentByAda,paymentByPaypal, paypalSuccess, paypalCancel,paymentByStripe,stripeSuccess,stripeCancel} from '../controllers/transactionController.js'


const courseRouter = express.Router()

courseRouter.post('/payment-by-paypal', paymentByPaypal) 
courseRouter.get('/paypal-success', paypalSuccess); 
courseRouter.get('/paypal-cancel', paypalCancel); 

courseRouter.post('/payment-by-stripe', paymentByStripe);
courseRouter.get('/stripe-success', stripeSuccess);
courseRouter.get('/stripe-cancel', stripeCancel);

courseRouter.get('/top-rated', getTopRatedCourses)
courseRouter.get('/all', getAllCourse)
courseRouter.get('/:id', getCourseId)
courseRouter.post('/payment', paymentByAda)
courseRouter.get('/by-educator/:educatorId', getCoursesByEducator)


export default courseRouter;