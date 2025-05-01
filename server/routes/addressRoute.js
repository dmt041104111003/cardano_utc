import express from 'express';
import { saveAddress, findAddress, checkAddress } from '../controllers/addressController.js';

const addressRouter = express.Router();

addressRouter.post('/save', saveAddress);
addressRouter.get('/find', findAddress);
addressRouter.get('/check', checkAddress);

export default addressRouter;
