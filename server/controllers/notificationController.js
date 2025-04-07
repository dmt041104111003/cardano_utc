import Notification from "../models/notification.js";
import mongoose from "mongoose";
import Course from "../models/course.js";
import User from "../models/User.js";
import { Purchase } from "../models/Purchase.js";
import { CourseProgress } from '../models/courseProgress.js';

export const getCertificateStatus = async (req, res) => {
    try {
        const { studentId, courseId } = req.query;

        if (!studentId || !courseId) {
            return res.status(400).json({
                success: false,
                message: 'Student ID and Course ID are required'
            });
        }

        console.log('Query params:', { studentId, courseId });

        // Find the latest certificate request notification
        const notification = await Notification.findOne({
            studentId,
            courseId,
            type: 'certificate_request'
        })
        .sort({ createdAt: -1 });

        console.log('Found notification:', JSON.stringify(notification, null, 2));

        if (!notification) {
            return res.status(200).json({
                success: true,
                notification: null
            });
        }

        // Populate course info
        const populatedNotification = await notification.populate('courseId', 'courseTitle');
        console.log('After populate:', JSON.stringify(populatedNotification, null, 2));

        // Add wallet address from data
        const result = {
            ...populatedNotification.toObject(),
            walletAddress: populatedNotification.data?.walletAddress
        };

        console.log('Final result:', JSON.stringify(result, null, 2));

        return res.status(200).json({
            success: true,
            notification: result
        });

    } catch (error) {
        console.error("Error getting certificate status:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAll = async (req, res) => {
    try {
        const { educatorId } = req.query;

        // Get notifications for this educator
        const notifications = await Notification.find({ 
            educatorId,
            educatorModel: educatorId.startsWith('user_') ? 'ClerkUser' : 'User'
        })
        .populate({
            path: 'courseId',
            select: 'courseTitle educator'
        })
        .populate({
            path: 'studentId',
            select: 'name avatar walletAddress',
            model: 'User' // Chỉ định rõ model là User
        })
        .sort({ createdAt: -1 });

        // Format notifications
        const formattedNotifications = notifications.map(notification => ({
            _id: notification._id,
            studentId: notification.studentId ? {
                _id: notification.studentId._id,
                name: notification.studentId.name || 'Unknown Student',
                avatar: notification.studentId.avatar,
                walletAddress: notification.studentId.walletAddress
            } : {
                _id: notification.data?.userId,
                name: notification.data?.userName || 'Unknown Student',
                walletAddress: notification.data?.walletAddress
            },
            courseId: notification.courseId,
            status: notification.status,
            type: notification.type,
            message: notification.message,
            data: notification.data,
            createdAt: notification.createdAt
        }));

        return res.status(200).json({ 
            success: true, 
            notifications: formattedNotifications 
        });
    } catch (error) {
        console.error("Error getting notifications:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const { educatorId } = req.query;
        
        // Count pending notifications
        const count = await Notification.countDocuments({
            educatorId,
            educatorModel: educatorId.startsWith('user_') ? 'ClerkUser' : 'User',
            status: 'pending'
        });

        return res.status(200).json({ success: true, count });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid notification ID' });
        }

        const notification = await Notification.findByIdAndUpdate(
            id,
            { status: 'completed' },
            { new: true }
        )
        .populate({
            path: 'courseId',
            select: 'courseTitle'
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        return res.status(200).json({ success: true, notification });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createNew = async (req, res) => {
    try {
        const { studentId, courseId, educatorId, type, message, data } = req.body;

        if (!studentId || !courseId || !educatorId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const notification = await Notification.create({
            studentId,
            studentModel: studentId.startsWith('user_') ? 'ClerkUser' : 'User',
            courseId,
            educatorId,
            educatorModel: educatorId.startsWith('user_') ? 'ClerkUser' : 'User',
            type: type || 'other',
            message,
            data,
            status: 'pending'
        });

        const populatedNotification = await Notification.findById(notification._id)
            .populate({
                path: 'courseId',
                select: 'courseTitle'
            });

        return res.status(201).json({ 
            success: true, 
            notification: populatedNotification 
        });
    } catch (error) {
        console.error("Error creating notification:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
