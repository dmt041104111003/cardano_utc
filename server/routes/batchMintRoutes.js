import express from 'express';
import { handleBatchMintRequest } from '../controllers/batchMintController.js';

const batchMintRouter = express.Router();

// Route for batch minting certificates
batchMintRouter.post('/batch-mint', handleBatchMintRequest);

export default batchMintRouter;
