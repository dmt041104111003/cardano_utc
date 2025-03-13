import express from "express";
import { issueNewCertificate,getDetailCertificate } from "../controllers/certificateController.js";

const certificateRouter = express.Router()

certificateRouter.post('/issue', issueNewCertificate)
certificateRouter.get('/:userId/:courseId', getDetailCertificate)

export default certificateRouter
