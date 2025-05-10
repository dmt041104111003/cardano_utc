import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true }, 
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    certificateUrl: { type: String, required: true },
    transactionHash: { type: String, required: false, default: "pending" },
    policyId: { type: String, required: false },
    assetName: { type: String, required: false }, // Thêm trường assetName để phân biệt NFT trong mint all
    issueBy: { type: String, ref: 'User', required: true }, 
}, { timestamps: true, minimize: false });

const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;