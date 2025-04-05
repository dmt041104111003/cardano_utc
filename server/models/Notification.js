import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    studentId: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true,
        refPath: 'studentModel'
    },
    studentModel: {
        type: String,
        required: true,
        enum: ['User', 'ClerkUser'],
        default: 'User'
    },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    educatorId: { 
        type: mongoose.Schema.Types.Mixed,
        required: true,
        refPath: 'educatorModel'
    },
    educatorModel: {
        type: String,
        required: true,
        enum: ['User', 'ClerkUser'],
        default: 'User'
    },
    type: { type: String, enum: ['certificate_request', 'other'], required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    data: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;