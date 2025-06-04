import express from 'express';
import { handleBatchMintRequest } from '../controllers/batchMintController.js';

const batchMintRouter = express.Router();

batchMintRouter.post('/batch-mint', handleBatchMintRequest);

export default batchMintRouter;
