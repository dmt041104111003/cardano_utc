import express from 'express';
import { createCourseTx } from '../controllers/blockchainController.js';

const blockchainRouter = express.Router();

blockchainRouter.post('/create-course-tx', createCourseTx);

export default blockchainRouter;
