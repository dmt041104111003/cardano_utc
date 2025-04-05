import mongoose from "mongoose";

const TransationSchema = new mongoose.Schema({
    user: { type: String, ref: 'User', required: true },
    course: { type: String, ref: 'Course', required: true }, 
    amount: { type: Number, required: true }, 
    currency: { type: String,  enum: ["VND", "USD", "ADA"], default: "ADA" }, 
    paymentMethod: { type: String, required: true }, 
    status: { 
        type: String, 
        enum: ["pending", "success", "failed"], 
        default: "pending" 
    }, 
    transactionId: { type: String, unique: true },
    note: { type: String }, 
    createdAt: { type: Date, default: Date.now }, 

}, { timestamps: true, minimize: false });

const Transation = mongoose.model('Transation', TransationSchema);
export default Transation;
