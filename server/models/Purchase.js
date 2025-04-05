import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    userId: {
        type: String,
        ref: 'User',
        required: true
    },
    amount: { type: Number, required: true },
    status: {
        type: String, enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    currency: { type: String,  enum: ["VND", "USD", "ADA"], default: "ADA" }, 
    paymentMethod: { type: String, required: true }, 
    note: { type: String }, 
    createdAt: { type: Date, default: Date.now }, 
}, { timestamps: true });

export const Purchase = mongoose.model('Purchase', PurchaseSchema)