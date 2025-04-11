import express from "express";
import { createUnsignedMintTx, createNewCertificate, getDetailCertificate, getCertificateByTx, updateCertificate } from "../controllers/certificateController.js";

const certificateRouter = express.Router()

certificateRouter.post('/mint', createUnsignedMintTx)
certificateRouter.post('/save', createNewCertificate)
certificateRouter.post('/update', updateCertificate)
certificateRouter.get('/by-tx/:txHash', getCertificateByTx)  // Specific route first
certificateRouter.get('/:userId/:courseId', getDetailCertificate)  // Generic route last

export default certificateRouter
