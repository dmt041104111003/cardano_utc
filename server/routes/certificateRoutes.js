import express from "express";
import { createUnsignedMintTx, createNewCertificate, getDetailCertificate, getCertificateByTx } from "../controllers/certificateController.js";

const certificateRouter = express.Router()

certificateRouter.post('/mint', createUnsignedMintTx)
certificateRouter.post('/save', createNewCertificate)
certificateRouter.get('/by-tx/:txHash', getCertificateByTx)  // Specific route first
certificateRouter.get('/:userId/:courseId', getDetailCertificate)  // Generic route last

export default certificateRouter
