import express from "express";
import { createNew, getAll, getCertificateStatus, getUnreadCount, markAsRead } from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get('/all', getAll);
notificationRouter.get('/certificate-status', getCertificateStatus);
notificationRouter.get('/unread-count', getUnreadCount);
notificationRouter.put('/:id/read', markAsRead);
notificationRouter.post('/create', createNew);

export default notificationRouter;
