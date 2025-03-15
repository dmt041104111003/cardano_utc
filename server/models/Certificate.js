import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }, 
    certificateUrl: { type: String, required: true }, 
    transactionHash: { type: String, required: true }, 
    issueBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
}, { timestamps: true, minimize: false });

const Certificate = mongoose.model('Certificate', certificateSchema);
export  default Certificate;