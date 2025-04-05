import express from "express";
import { createUnsignedMintTx, createNewCertificate, getDetailCertificate } from "../controllers/certificateController.js";

const certificateRouter = express.Router()

certificateRouter.post('/mint', createUnsignedMintTx)
certificateRouter.post('/save', createNewCertificate)
certificateRouter.get('/:userId/:courseId', getDetailCertificate)

export default certificateRouter
