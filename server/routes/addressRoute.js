import express from 'express';
import { saveAddress, findAddress } from '../controllers/addressController.js';

const addressRouter = express.Router();

addressRouter.post('/save', saveAddress);
addressRouter.get('/find', findAddress);

export default addressRouter;
